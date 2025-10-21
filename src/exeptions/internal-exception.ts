import { ErrorCode } from "@/constants"
import { HttpException } from "./index"

export class InternalException extends HttpException {
  constructor(message: string, errorCode: ErrorCode, errors: any) {
    super(message, errorCode, 500, errors)
  }
}
