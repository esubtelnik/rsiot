
export interface ErrorResponse {
    message: string;
    code?: string;
    statusCode?: number;
  }
  
  export interface ApiResponse<T> {
    data?: T;
    successful: boolean;
    error?: ErrorResponse;
  }
  
  export function wrapResponse<T>(data?: T): ApiResponse<T> {
    return { data, successful: true };
  }
  
  export function wrapError<T>(
    message: string,
    statusCode: number = 500,
    code?: string
  ): ApiResponse<T> {
    return {
      data: undefined,
      successful: false,
      error: { message, statusCode, code },
    };
  }