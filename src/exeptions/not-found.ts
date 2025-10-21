import { ErrorCode, HTTP_STATUS } from "@/constants"
import { HttpException } from "./index"

export class NotFoundException extends HttpException {
  constructor(message: string, errorCode: ErrorCode, errors: any = null) {
    super(message, errorCode, HTTP_STATUS.NOT_FOUND, errors)
  }
}
