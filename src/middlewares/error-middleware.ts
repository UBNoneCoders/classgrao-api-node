import { NextFunction, Request, Response } from "express"

import { HTTP_STATUS } from "@/constants"
import { HttpException } from "@/exeptions"
import { failure } from "@/utils/response"

export const errorMiddleware = (
  error: any,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (error instanceof HttpException) {
    return res
      .status(error.statusCode)
      .json(failure(error.message, error.errorCode, error.errors))
  }

  return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
    error: "Internal Server Error",
    message: error.message,
  })
}
