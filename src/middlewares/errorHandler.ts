import { Request, Response, NextFunction } from "express";
import { AppError } from "../utils/apiErrors";
import { wrapError } from "../utils/responseWrapper";
import { ValidateError } from "tsoa";

export function errorHandler(
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) {   
  if (err instanceof ValidateError) {
    console.warn(`Validation error for ${req.path}:`, err.fields);
    
    const messages = Object.entries(err.fields)
      .map(([field, fieldError]) => {
        return `${field}: ${fieldError.message}`;
      })
      .join(", ");

    return res.status(400).json(
      wrapError(
        `Validation failed: ${messages}`,
        400,
        "VALIDATION_ERROR"
      )
    );
  }

  if (err instanceof AppError) {
    return res.status(err.statusCode).json(
      wrapError(err.message, err.statusCode, err.code)
    );
  }

  console.error("Unexpected error:", err);

  return res.status(500).json(
    wrapError("Internal server error", 500, "INTERNAL_ERROR")
  );
}

export function notFoundHandler(
  req: Request,
  res: Response,
  next: NextFunction
) {
  res.status(404).json(
    wrapError(`Route ${req.url} not found`, 404, "NOT_FOUND")
  );
}