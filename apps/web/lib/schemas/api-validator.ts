import { z } from "zod";
import type { NextApiRequest, NextApiResponse } from "next";

export {
  commonSchemas,
  validateSchema,
  formatValidationErrors,
  apiSuccess,
  apiError,
  apiBadRequest,
  apiUnauthorized,
  apiForbidden,
  apiNotFound,
  apiMethodNotAllowed,
  apiConflict,
  apiInternalError,
} from "@gds-si/shared-schemas";

export type {
  ValidationSuccess,
  ValidationError,
  ValidationResult,
  ApiValidationError,
  ApiErrorCode,
  ApiSuccessResponse,
  ApiErrorResponse,
  ApiResponse,
  InferSchema,
} from "@gds-si/shared-schemas";

import {
  validateSchema,
  formatValidationErrors,
  apiSuccess,
  apiBadRequest,
  apiUnauthorized,
  apiForbidden,
  apiNotFound,
  apiMethodNotAllowed,
  apiConflict,
  apiInternalError,
  apiError,
} from "@gds-si/shared-schemas";

import type { ApiErrorCode } from "@gds-si/shared-schemas";

export function withBodyValidation<T extends z.ZodType>(
  schema: T,
  handler: (
    req: NextApiRequest,
    res: NextApiResponse,
    data: z.infer<T>
  ) => Promise<void> | void
) {
  return async (req: NextApiRequest, res: NextApiResponse) => {
    const result = validateSchema(schema, req.body);

    if (!result.success) {
      return res.status(400).json(formatValidationErrors(result.errors));
    }

    return handler(req, res, result.data);
  };
}

export function validateQuery<T extends z.ZodType>(
  schema: T,
  query: NextApiRequest["query"]
) {
  return validateSchema(schema, query);
}

export function validateOrRespond<T extends z.ZodType>(
  schema: T,
  data: unknown,
  res: NextApiResponse
): z.infer<T> | null {
  const result = validateSchema(schema, data);

  if (!result.success) {
    res.status(400).json(formatValidationErrors(result.errors));
    return null;
  }

  return result.data;
}

export class ApiResponder {
  constructor(private res: NextApiResponse) {}

  success<T>(data: T, message?: string, status = 200) {
    return this.res.status(status).json(apiSuccess(data, message));
  }

  created<T>(data: T, message = "Creado exitosamente") {
    return this.res.status(201).json(apiSuccess(data, message));
  }

  noContent() {
    return this.res.status(204).end();
  }

  badRequest(message?: string) {
    return this.res.status(400).json(apiBadRequest(message));
  }

  validationError(errors: z.ZodIssue[]) {
    return this.res.status(400).json(formatValidationErrors(errors));
  }

  unauthorized(message?: string) {
    return this.res.status(401).json(apiUnauthorized(message));
  }

  forbidden(message?: string) {
    return this.res.status(403).json(apiForbidden(message));
  }

  notFound(message?: string) {
    return this.res.status(404).json(apiNotFound(message));
  }

  methodNotAllowed(message?: string) {
    return this.res.status(405).json(apiMethodNotAllowed(message));
  }

  conflict(message?: string) {
    return this.res.status(409).json(apiConflict(message));
  }

  internalError(message?: string) {
    return this.res.status(500).json(apiInternalError(message));
  }

  error(message: string, code: ApiErrorCode, status: number) {
    return this.res.status(status).json(apiError(message, code));
  }
}
