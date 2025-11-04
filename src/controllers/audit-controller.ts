import { ErrorCode, HTTP_STATUS, Roles } from "@/constants"
import AuditRepository from "@/repositories/audit-repository"
import { failure, success } from "@/utils/response"
import { NextFunction, Request, Response } from "express"

export const getAuditLogs = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.user?.id

    if (!userId) {
      return res
        .status(HTTP_STATUS.UNAUTHORIZED)
        .json(failure("Usuário não autenticado", ErrorCode.UNAUTHORIZED))
    }

    if (req.user?.role === Roles.ADMIN) {
      const { data: auditLogs, error: auditError } =
        await AuditRepository.findAll()

      if (auditError) {
        return res
          .status(HTTP_STATUS.INTERNAL_SERVER_ERROR)
          .json(
            failure(
              "Erro ao buscar logs de auditoria",
              ErrorCode.INTERNAL_SERVER_ERROR,
              [auditError]
            )
          )
      }

      return res.json(
        success("Logs de auditoria buscados com sucesso", {
          auditLogs,
        })
      )
    }

    const { data: auditLogs, error: auditError } =
      await AuditRepository.findByUserId(userId)

    if (auditError) {
      return res
        .status(HTTP_STATUS.INTERNAL_SERVER_ERROR)
        .json(
          failure(
            "Erro ao buscar logs de auditoria",
            ErrorCode.INTERNAL_SERVER_ERROR,
            [auditError]
          )
        )
    }

    return res.json(
      success("Logs de auditoria buscados com sucesso", {
        auditLogs,
      })
    )
  } catch (err) {
    next(err)
  }
}

export const getAuditLogById = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.user?.id
    const auditId = req.params.id

    if (!userId) {
      return res
        .status(HTTP_STATUS.UNAUTHORIZED)
        .json(failure("Usuário não autenticado", ErrorCode.UNAUTHORIZED))
    }

    const { data: auditLog, error: auditError } =
      await AuditRepository.findById(auditId)

    if (auditError) {
      return res
        .status(HTTP_STATUS.INTERNAL_SERVER_ERROR)
        .json(
          failure(
            "Erro ao buscar log de auditoria",
            ErrorCode.INTERNAL_SERVER_ERROR,
            [auditError]
          )
        )
    }

    if (!auditLog) {
      return res
        .status(HTTP_STATUS.NOT_FOUND)
        .json(failure("Log de auditoria não encontrado", ErrorCode.NOT_FOUND))
    }

    if (auditLog.user_id !== userId && req.user?.role !== Roles.ADMIN) {
      return res
        .status(HTTP_STATUS.FORBIDDEN)
        .json(failure("Acesso negado ao log de auditoria", ErrorCode.FORBIDDEN))
    }

    return res.json(
      success("Log de auditoria buscado com sucesso", {
        auditLog,
      })
    )
  } catch (err) {
    next(err)
  }
}
