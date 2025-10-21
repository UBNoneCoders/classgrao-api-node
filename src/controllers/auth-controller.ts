import { JWT_EXPIRES_IN, JWT_SECRET } from "@/config"
import { ErrorCode, HTTP_STATUS } from "@/constants"
import UserRepository from "@/repositories/user-repository"
import authSchema from "@/schemas/auth-schema"
import { registerAudit } from "@/utils/audit"
import { failure, success } from "@/utils/response"
import bcrypt from "bcrypt"
import { NextFunction, Request, Response } from "express"
import jwt from "jsonwebtoken"

export const login = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const parsed = authSchema.login.safeParse(req.body)

    if (!parsed.success) {
      return res.status(400).json({
        status: "error",
        message: parsed.error.issues[0].message,
      })
    }

    const { username, password } = parsed.data

    const { data: user, error: userError } =
      await UserRepository.findByUsername(username)

    if (userError || !user) {
      await registerAudit({
        action: "LOGIN_USER_NOT_FOUND",
        description: "Tentativa de login com usuário inexistente",
        ipAddress: req.ip,
      })

      return res
        .status(HTTP_STATUS.UNAUTHORIZED)
        .json(
          failure("Invalid username or password", ErrorCode.INVALID_CREDENTIALS)
        )
    }

    const isPasswordValid = await bcrypt.compare(password, user.password_hash)

    if (!isPasswordValid) {
      await registerAudit({
        userId: user.id,
        action: "LOGIN_FAILED",
        description: "Tentativa de login com senha incorreta",
        ipAddress: req.ip,
      })
      return res
        .status(HTTP_STATUS.UNAUTHORIZED)
        .json(
          failure("Invalid username or password", ErrorCode.INVALID_CREDENTIALS)
        )
    }

    if (!user.active) {
      await registerAudit({
        userId: user.id,
        action: "LOGIN_BLOCKED",
        description: "Tentativa de login com conta desativada",
        ipAddress: req.ip,
        details: {
          motivo: "conta_desativada",
          username: user.username,
        },
      })
      return res
        .status(HTTP_STATUS.FORBIDDEN)
        .json(failure("Conta desativada", ErrorCode.ACCOUNT_DISABLED))
    }

    const token = jwt.sign({ id: user.id }, JWT_SECRET, {
      expiresIn: JWT_EXPIRES_IN,
    })

    await registerAudit({
      userId: user.id,
      action: "LOGIN_SUCCESS",
      description: "Realizou login com sucesso",
      ipAddress: req.ip,
    })

    return res.status(HTTP_STATUS.OK).json(
      success("User logged in successfully", {
        user: user,
        token,
      })
    )
  } catch (err) {
    return next(err)
  }
}

export const me = (req: Request, res: Response) => {
  const user = req.user
  res.json({
    status: "success",
    user,
  })
}
