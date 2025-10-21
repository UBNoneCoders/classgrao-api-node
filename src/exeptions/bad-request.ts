import { ErrorCode, HTTP_STATUS } from "@/constants"
import { HttpException } from "./index"

export class BadRequestException extends HttpException {
  constructor(message: string, errorCode: ErrorCode, errors: any = null) {
    super(message, errorCode, HTTP_STATUS.BAD_REQUEST, errors)
  }
}
