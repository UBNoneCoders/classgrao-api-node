import { NextFunction, Request, Response } from "express"
import { ErrorCode } from "./constants"
import { HttpException } from "./exeptions"
import { InternalException } from "./exeptions/internal-exception"

export const errorHandler = (method: Function) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      await method(req, res, next)
    } catch (error) {
      let exception: HttpException
      if (error instanceof HttpException) {
        exception = error
      } else {
        exception = new InternalException(
          "Internal server error",
          ErrorCode.INTERNAL_SERVER_ERROR,
          error
        )
      }
    }
  }
}
