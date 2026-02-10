import type { NextApiRequest, NextApiResponse } from "next";
import { db, adminAuth } from "@/lib/firebaseAdmin";
import {
  createExpenseApiSchema,
  expenseQuerySchema,
  validateSchema,
  commonSchemas,
  ApiResponder,
  apiError,
} from "@/lib/schemas";
import {
  getCache,
  setCache,
  invalidateCache,
  CACHE_KEYS,
  CACHE_TTL,
} from "@/lib/redis";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const respond = new ApiResponder(res);

  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return respond.unauthorized();
    }

    const token = authHeader.split("Bearer ")[1];
    await adminAuth.verifyIdToken(token);

    // Validar user_uid según el método
    const userUIDRaw =
      req.method === "GET" ? req.query.user_uid : req.body.user_uid;
    const userUIDValidation = commonSchemas.userUid.safeParse(userUIDRaw);

    if (!userUIDValidation.success) {
      return res
        .status(400)
        .json(
          apiError("Error de validación", "VALIDATION_ERROR", [
            { field: "user_uid", message: "User UID es requerido" },
          ])
        );
    }

    const userUID = userUIDValidation.data;

    switch (req.method) {
      case "GET":
        return getUserExpenses(userUID, res, req);
      case "POST":
        return createExpense(req, res, userUID);
      default:
        return respond.methodNotAllowed();
    }
  } catch (error) {
    console.error("Error en la API /api/expenses:", error);
    return respond.internalError();
  }
}

const getUserExpenses = async (
  userUID: string,
  res: NextApiResponse,
  req: NextApiRequest
) => {
  const respond = new ApiResponder(res);

  try {
    const queryValidation = validateSchema(expenseQuerySchema, req.query);
    if (!queryValidation.success) {
      return respond.validationError(queryValidation.errors);
    }

    const cacheKey = CACHE_KEYS.expenses(userUID);

    const cachedData = await getCache<Record<string, unknown>[]>(cacheKey);
    if (cachedData) {
      return respond.success(cachedData);
    }

    const querySnapshot = await db
      .collection("expenses")
      .where("user_uid", "==", userUID)
      .orderBy("date", "asc")
      .get();

    const expenses = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    await setCache(cacheKey, expenses, CACHE_TTL.EXPENSES);

    return respond.success(expenses);
  } catch (error) {
    console.error("Error al obtener gastos:", error);
    return respond.internalError("Error al obtener gastos");
  }
};

const createExpense = async (
  req: NextApiRequest,
  res: NextApiResponse,
  userUID: string
) => {
  const respond = new ApiResponder(res);

  try {
    // Validar body con Zod
    const validation = validateSchema(createExpenseApiSchema, req.body);
    if (!validation.success) {
      return respond.validationError(validation.errors);
    }

    const {
      date,
      amount,
      expenseType,
      description,
      dollarRate,
      otherType,
      isRecurring,
    } = validation.data;

    const userDoc = await db.collection("users").doc(userUID).get();
    const userData = userDoc.data();
    const userCurrency = userData?.currency || null;

    // Validación de negocio: dollarRate requerido para monedas no USD
    if (userCurrency !== "USD" && !dollarRate) {
      return res.status(400).json(
        apiError("Error de validación", "VALIDATION_ERROR", [
          {
            field: "dollarRate",
            message: "Dollar rate es requerido para monedas distintas a USD",
          },
        ])
      );
    }

    const calculatedAmountInDollars =
      userCurrency === "USD" ? amount : amount / (dollarRate || 1);

    const baseExpense = {
      amount,
      amountInDollars: calculatedAmountInDollars,
      expenseType,
      description: description || "",
      dollarRate: userCurrency === "USD" ? 1 : dollarRate,
      user_uid: userUID,
      otherType: otherType ?? "",
      isRecurring: isRecurring ?? false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    if (isRecurring) {
      const expenseDate = new Date(date);
      const currentDate = new Date();
      let batch = db.batch();
      let operationCount = 0;
      const processedExpenses: string[] = [];

      while (expenseDate <= currentDate) {
        const formattedDate = expenseDate.toISOString().split("T")[0];

        const newExpense = {
          ...baseExpense,
          date: formattedDate,
        };

        const newDocRef = db.collection("expenses").doc();
        batch.set(newDocRef, newExpense);
        processedExpenses.push(newDocRef.id);
        operationCount++;

        if (operationCount >= 500) {
          await batch.commit();
          batch = db.batch();
          operationCount = 0;
        }

        expenseDate.setMonth(expenseDate.getMonth() + 1);
      }

      if (operationCount > 0) {
        await batch.commit();
      }

      await invalidateCache(CACHE_KEYS.expenses(userUID));

      return respond.created(
        { count: processedExpenses.length, ids: processedExpenses },
        "Gastos recurrentes creados exitosamente"
      );
    }

    const newExpense = {
      ...baseExpense,
      date,
    };

    const docRef = await db.collection("expenses").add(newExpense);

    await invalidateCache(CACHE_KEYS.expenses(userUID));

    return respond.created({ id: docRef.id }, "Gasto creado exitosamente");
  } catch (error) {
    console.error("Error al crear gasto:", error);
    return respond.internalError("Error al crear gasto");
  }
};
