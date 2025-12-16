import { StatusCodes } from 'http-status-codes';

export class AppError extends Error {
    constructor(
      public message: string,
      public statusCode: number = StatusCodes.INTERNAL_SERVER_ERROR,
      public code?: string
    ) {
      super(message);
      this.name = this.constructor.name;
      Error.captureStackTrace(this, this.constructor);
    }
  }
  
  export class ValidationError extends AppError {
    constructor(message: string) {
      super(message, StatusCodes.BAD_REQUEST, "VALIDATION_ERROR");
    }
  }
  
  export class NotFoundError extends AppError {
    constructor(message: string) {
      super(message, StatusCodes.NOT_FOUND, "NOT_FOUND");
    }
  }
  
  export class DatabaseError extends AppError {
    constructor(message: string) {
      super(message, StatusCodes.INTERNAL_SERVER_ERROR, "DATABASE_ERROR");
    }
  }

  export class BadRequestError extends AppError {
    constructor(message: string) {
      super(message, StatusCodes.BAD_REQUEST, "BAD_REQUEST");
    }
  }