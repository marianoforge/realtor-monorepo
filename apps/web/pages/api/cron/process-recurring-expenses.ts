import type { NextApiRequest, NextApiResponse } from "next";
import { db } from "@/lib/firebaseAdmin";
import { invalidateCache, CACHE_KEYS } from "@/lib/redis";

interface RecurringExpense {
  id: string;
  user_uid: string;
  expenseType: string;
  description: string;
  amount: number;
  amountInDollars?: number;
  dollarRate?: number;
  otherType?: string;
  isRecurring: boolean;
  date: string;
  createdAt?: string;
  updatedAt?: string;
}

/**
 * Genera una clave única para agrupar gastos recurrentes similares.
 * Dos gastos se consideran "el mismo" si tienen el mismo usuario, tipo, descripción y monto.
 */
function getExpenseGroupKey(expense: RecurringExpense): string {
  return `${expense.user_uid}_${expense.expenseType}_${expense.description}_${expense.amount}`;
}

/**
 * Genera una clave de mes en formato "YYYY-MM" para comparaciones.
 */
function getMonthKey(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
}

/**
 * Calcula el día válido para un mes dado, ajustando si el día original no existe.
 * Por ejemplo, si el día original es 31 y el mes es febrero, retorna 28 (o 29 en bisiesto).
 */
function getValidDayForMonth(
  originalDay: number,
  year: number,
  month: number
): number {
  const lastDayOfMonth = new Date(year, month + 1, 0).getDate();
  return Math.min(originalDay, lastDayOfMonth);
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    if (req.method !== "GET" && req.method !== "POST") {
      return res.status(405).json({ message: "Method not allowed" });
    }

    const authHeader = req.headers.authorization;
    if (
      !process.env.CRON_SECRET ||
      authHeader !== `Bearer ${process.env.CRON_SECRET}`
    ) {
      return res.status(401).json({
        message: "Unauthorized access",
      });
    }

    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    const querySnapshot = await db
      .collection("expenses")
      .where("isRecurring", "==", true)
      .get();

    if (querySnapshot.empty) {
      return res
        .status(200)
        .json({ message: "No recurring expenses to process" });
    }

    const expenseGroups = new Map<string, RecurringExpense[]>();

    querySnapshot.docs.forEach((doc) => {
      const expense = { id: doc.id, ...doc.data() } as RecurringExpense;
      const key = getExpenseGroupKey(expense);

      if (!expenseGroups.has(key)) {
        expenseGroups.set(key, []);
      }
      expenseGroups.get(key)!.push(expense);
    });

    const processedExpenses: string[] = [];
    const affectedUserIds = new Set<string>();
    const batchSize = 450;
    let batch = db.batch();
    let operationCount = 0;

    for (const [groupKey, expenses] of Array.from(expenseGroups.entries())) {
      const oldestExpense = expenses.reduce(
        (oldest: RecurringExpense, current: RecurringExpense) => {
          return new Date(current.date) < new Date(oldest.date)
            ? current
            : oldest;
        }
      );

      const oldestDate = new Date(oldestExpense.date);
      const originalDay = oldestDate.getDate();

      const existingMonths = new Set<string>();
      expenses.forEach((expense: RecurringExpense) => {
        const date = new Date(expense.date);
        existingMonths.add(getMonthKey(date));
      });

      const iterDate = new Date(
        oldestDate.getFullYear(),
        oldestDate.getMonth(),
        1
      );
      const endDate = new Date(currentYear, currentMonth, 1);

      while (iterDate <= endDate) {
        const monthKey = getMonthKey(iterDate);

        if (!existingMonths.has(monthKey)) {
          const validDay = getValidDayForMonth(
            originalDay,
            iterDate.getFullYear(),
            iterDate.getMonth()
          );

          const newDate = new Date(
            iterDate.getFullYear(),
            iterDate.getMonth(),
            validDay
          );
          const formattedDate = newDate.toISOString().split("T")[0];

          const newExpense: Omit<RecurringExpense, "id"> = {
            user_uid: oldestExpense.user_uid,
            expenseType: oldestExpense.expenseType,
            description: oldestExpense.description,
            amount: oldestExpense.amount,
            amountInDollars: oldestExpense.amountInDollars,
            dollarRate: oldestExpense.dollarRate,
            otherType: oldestExpense.otherType || "",
            isRecurring: true,
            date: formattedDate,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          };

          const newDocRef = db.collection("expenses").doc();
          batch.set(newDocRef, newExpense);
          processedExpenses.push(newDocRef.id);
          affectedUserIds.add(oldestExpense.user_uid);
          operationCount++;

          if (operationCount >= batchSize) {
            await batch.commit();
            batch = db.batch();
            operationCount = 0;
          }
        }

        iterDate.setMonth(iterDate.getMonth() + 1);
      }
    }

    if (operationCount > 0) {
      await batch.commit();
    }

    await Promise.all(
      Array.from(affectedUserIds).map((userId) =>
        invalidateCache(CACHE_KEYS.expenses(userId))
      )
    );

    return res.status(200).json({
      message: "Recurring expenses processed successfully",
      count: processedExpenses.length,
      affectedUsers: affectedUserIds.size,
    });
  } catch (error) {
    console.error("Error procesando gastos recurrentes:", error);
    return res.status(500).json({
      message: "Error processing recurring expenses",
      error: error instanceof Error ? error.message : String(error),
    });
  }
}
