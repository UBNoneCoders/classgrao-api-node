import { ErrorCode } from "@/constants/index.js"
import { ApiResponse } from "@/types/api-response-type.js"

export function success<T>(message = "Success", data?: T): ApiResponse<T> {
  return {
    status: true,
    message,
    data,
  }
}

export function failure(
  message: string,
  errorCode: ErrorCode,
  errors?: any[]
): ApiResponse<null> {
  return {
    status: false,
    message,
    errorCode,
    errors,
  }
}
