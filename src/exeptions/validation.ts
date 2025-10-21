import { ErrorCode, HTTP_STATUS } from "@/constants"
import { HttpException } from "./index"

export class UnprocessableEntityException extends HttpException {
  constructor(message: string, errors: any = null) {
    super(
      message,
      ErrorCode.VALIDATION_ERROR,
      HTTP_STATUS.UNPROCESSABLE_ENTITY,
      errors
    )
  }
}
