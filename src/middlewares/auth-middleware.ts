import { NextFunction, Request, Response } from "express"
import * as jwt from "jsonwebtoken"
import { JWT_SECRET } from "@/config"
import { ErrorCode } from "@/constants"
import { UnauthorizedException } from "@/exeptions/unauthorized"
import UserRepository from "@/repositories/user-repository"

const authMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const token = req.headers.authorization

  if (!token) {
    return next(
      new UnauthorizedException("No token provided", ErrorCode.TOKEN_MISSING)
    )
  }

  try {
    const payload = jwt.verify(token, JWT_SECRET) as any
    const { data: user, error } = await UserRepository.findyById(payload.id)

    if (!user || error) {
      return next(
        new UnauthorizedException("Token is invalid", ErrorCode.TOKEN_INVALID)
      )
    }

    req.user = user
    next()
  } catch (error: any) {
    next(new UnauthorizedException("Token is invalid", ErrorCode.TOKEN_INVALID))
  }
}

export default authMiddleware
