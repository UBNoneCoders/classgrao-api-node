import { ErrorCode } from "@/constants"

export class HttpException extends Error {
  message: string
  errorCode: ErrorCode
  statusCode: number
  errors: any

  constructor(
    message: string,
    errorCode: ErrorCode,
    statusCode: number,
    errors: any = null
  ) {
    super(message)
    this.message = message
    this.errorCode = errorCode
    this.statusCode = statusCode
    this.errors = errors
  }
}
