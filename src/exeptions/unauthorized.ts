import { ErrorCode, HTTP_STATUS } from "@/constants"
import { HttpException } from "./index"

export class UnauthorizedException extends HttpException {
  constructor(message: string, errorCode: ErrorCode, errors: any = null) {
    super(message, errorCode, HTTP_STATUS.UNAUTHORIZED, errors)
  }
}
