import { ErrorCode, HTTP_STATUS, Roles } from "@/constants"
import UserRepository from "@/repositories/user-repository"
import { createUserSchema, updateUserSchema } from "@/schemas/user-shema"
import { hashPassword } from "@/utils"
import { registerAudit } from "@/utils/audit"
import { failure, success } from "@/utils/response"
import { NextFunction, Request, Response } from "express"

export const createUser = async (
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

    if (req.user?.role !== Roles.ADMIN) {
      return res
        .status(HTTP_STATUS.FORBIDDEN)
        .json(
          failure(
            "Apenas administradores podem cadastrar usuários",
            ErrorCode.FORBIDDEN
          )
        )
    }

    const parsed = createUserSchema.safeParse(req.body)

    if (!parsed.success) {
      return res
        .status(HTTP_STATUS.BAD_REQUEST)
        .json(
          failure(
            "Dados de usuário inválidos",
            ErrorCode.VALIDATION_ERROR,
            parsed.error.issues
          )
        )
    }

    const { data: existingUser } = await UserRepository.findByUsername(
      parsed.data.username
    )

    if (existingUser) {
      return res
        .status(HTTP_STATUS.CONFLICT)
        .json(failure("Nome de usuário já cadastrado", ErrorCode.CONFLICT))
    }

    const passwordHash = await hashPassword(parsed.data.password)

    const { data: newUser, error: newUserError } =
      await UserRepository.createUser(
        parsed.data.username,
        passwordHash,
        parsed.data.name
      )

    if (newUserError) {
      return res
        .status(HTTP_STATUS.INTERNAL_SERVER_ERROR)
        .json(
          failure("Erro ao criar usuário", ErrorCode.INTERNAL_SERVER_ERROR, [
            newUserError,
          ])
        )
    }

    await registerAudit({
      userId: userId,
      action: "USER_CREATE",
      description: `Usuário ${newUser.username} criado com sucesso`,
      ipAddress: req.ip,
    })

    return res.status(HTTP_STATUS.CREATED).json(
      success("Usuário criado com sucesso", {
        user: newUser,
      })
    )
  } catch (err) {
    next(err)
  }
}

export const getUsers = async (
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

    if (req.user?.role !== Roles.ADMIN) {
      return res
        .status(HTTP_STATUS.FORBIDDEN)
        .json(
          failure(
            "Apenas administradores podem listar usuários",
            ErrorCode.FORBIDDEN
          )
        )
    }

    const { data: users, error: usersError } = await UserRepository.findAll()

    if (usersError) {
      return res
        .status(HTTP_STATUS.INTERNAL_SERVER_ERROR)
        .json(
          failure("Erro ao buscar usuários", ErrorCode.INTERNAL_SERVER_ERROR, [
            usersError,
          ])
        )
    }

    return res.json(
      success("Usuários buscados com sucesso", {
        users,
      })
    )
  } catch (err) {
    next(err)
  }
}

export const getUserById = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.user?.id
    const targetUserId = req.params.id

    if (!userId) {
      return res
        .status(HTTP_STATUS.UNAUTHORIZED)
        .json(failure("Usuário não autenticado", ErrorCode.UNAUTHORIZED))
    }

    if (userId !== targetUserId && req.user?.role !== Roles.ADMIN) {
      return res
        .status(HTTP_STATUS.FORBIDDEN)
        .json(failure("Acesso negado ao usuário", ErrorCode.FORBIDDEN))
    }

    const { data: user, error: userError } = await UserRepository.findById(
      targetUserId
    )

    if (userError) {
      return res
        .status(HTTP_STATUS.INTERNAL_SERVER_ERROR)
        .json(
          failure("Erro ao buscar usuário", ErrorCode.INTERNAL_SERVER_ERROR, [
            userError,
          ])
        )
    }

    if (!user) {
      return res
        .status(HTTP_STATUS.NOT_FOUND)
        .json(failure("Usuário não encontrado", ErrorCode.NOT_FOUND))
    }

    return res.json(
      success("Usuário buscado com sucesso", {
        user,
      })
    )
  } catch (err) {
    next(err)
  }
}

export const updateUser = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.user?.id
    const targetUserId = req.params.id

    if (!userId) {
      return res
        .status(HTTP_STATUS.UNAUTHORIZED)
        .json(failure("Usuário não autenticado", ErrorCode.UNAUTHORIZED))
    }

    // Usuário pode atualizar seus próprios dados ou admin pode atualizar qualquer usuário
    if (userId !== targetUserId && req.user?.role !== Roles.ADMIN) {
      return res
        .status(HTTP_STATUS.FORBIDDEN)
        .json(failure("Acesso negado ao usuário", ErrorCode.FORBIDDEN))
    }

    const parsed = updateUserSchema.safeParse(req.body)

    if (!parsed.success) {
      return res
        .status(HTTP_STATUS.BAD_REQUEST)
        .json(
          failure(
            "Dados de atualização inválidos",
            ErrorCode.VALIDATION_ERROR,
            parsed.error.issues
          )
        )
    }

    const { data: existingUser } = await UserRepository.findById(targetUserId)

    if (!existingUser) {
      return res
        .status(HTTP_STATUS.NOT_FOUND)
        .json(failure("Usuário não encontrado", ErrorCode.NOT_FOUND))
    }

    if (
      parsed.data.username &&
      parsed.data.username !== existingUser.username
    ) {
      const { data: userWithUsername } = await UserRepository.findByUsername(
        parsed.data.username
      )

      if (userWithUsername) {
        return res
          .status(HTTP_STATUS.CONFLICT)
          .json(failure("Nome de usuário já cadastrado", ErrorCode.CONFLICT))
      }
    }

    let updateData = { ...parsed.data }
    if (parsed.data.password) {
      const passwordHash = await hashPassword(parsed.data.password)
      updateData = { ...updateData, password: passwordHash }
      delete updateData.password
    }

    const { data: updatedUser, error: updateError } =
      await UserRepository.updateUser(targetUserId, updateData)

    if (updateError) {
      return res
        .status(HTTP_STATUS.INTERNAL_SERVER_ERROR)
        .json(
          failure(
            "Erro ao atualizar usuário",
            ErrorCode.INTERNAL_SERVER_ERROR,
            [updateError]
          )
        )
    }

    await registerAudit({
      userId: userId,
      action: "USER_UPDATE",
      description: `Usuário ${targetUserId} atualizado`,
      ipAddress: req.ip,
    })

    return res.json(
      success("Usuário atualizado com sucesso", {
        user: updatedUser,
      })
    )
  } catch (err) {
    next(err)
  }
}

export const deleteUser = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.user?.id
    const targetUserId = req.params.id

    if (!userId) {
      return res
        .status(HTTP_STATUS.UNAUTHORIZED)
        .json(failure("Usuário não autenticado", ErrorCode.UNAUTHORIZED))
    }

    if (req.user?.role !== Roles.ADMIN) {
      return res
        .status(HTTP_STATUS.FORBIDDEN)
        .json(
          failure(
            "Apenas administradores podem deletar usuários",
            ErrorCode.FORBIDDEN
          )
        )
    }

    if (userId === targetUserId) {
      return res
        .status(HTTP_STATUS.BAD_REQUEST)
        .json(
          failure(
            "Não é possível deletar seu próprio usuário",
            ErrorCode.VALIDATION_ERROR
          )
        )
    }

    const { data: user } = await UserRepository.findById(targetUserId)

    if (!user) {
      return res
        .status(HTTP_STATUS.NOT_FOUND)
        .json(failure("Usuário não encontrado", ErrorCode.NOT_FOUND))
    }

    const { error: deleteError } = await UserRepository.deleteUser(targetUserId)

    if (deleteError) {
      return res
        .status(HTTP_STATUS.INTERNAL_SERVER_ERROR)
        .json(
          failure("Erro ao deletar usuário", ErrorCode.INTERNAL_SERVER_ERROR, [
            deleteError,
          ])
        )
    }

    await registerAudit({
      userId: userId,
      action: "USER_DELETE",
      description: `Usuário ${user.username} deletado`,
      ipAddress: req.ip,
    })

    return res.status(HTTP_STATUS.NO_CONTENT).send()
  } catch (err) {
    next(err)
  }
}
