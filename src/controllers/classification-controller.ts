import { ErrorCode, HTTP_STATUS } from "@/constants"
import ClassificationRepository from "@/repositories/classification-repository"
import { classifySchema, fileSchema } from "@/schemas/classify-schema"
import { failure, success } from "@/utils/response"
import { NextFunction, Request, Response } from "express"

export const classifyGrain = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const parsed = classifySchema.safeParse(req.body)

    if (!parsed.success) {
      return res
        .status(HTTP_STATUS.BAD_REQUEST)
        .json(
          failure(
            "Dados de classificação inválidos",
            ErrorCode.VALIDATION_ERROR,
            parsed.error.issues
          )
        )
    }

    if (!req.file) {
      return res
        .status(HTTP_STATUS.BAD_REQUEST)
        .json(failure("A imagem é obrigatória", ErrorCode.VALIDATION_ERROR))
    }

    const fileParsed = fileSchema.safeParse(req.file)

    if (!fileParsed.success) {
      return res
        .status(HTTP_STATUS.BAD_REQUEST)
        .json(
          failure(
            "Dados de arquivo inválidos",
            ErrorCode.VALIDATION_ERROR,
            fileParsed.error.issues
          )
        )
    }

    const userId = req.user?.id

    if (!userId) {
      return res
        .status(HTTP_STATUS.UNAUTHORIZED)
        .json(failure("Usuário não autenticado", ErrorCode.UNAUTHORIZED))
    }

    const { data: imagePath, error: imageError } =
      await ClassificationRepository.saveImage(req.file)

    if (imageError) {
      return res
        .status(HTTP_STATUS.INTERNAL_SERVER_ERROR)
        .json(failure("Erro ao salvar imagem", ErrorCode.INTERNAL_SERVER_ERROR))
    }

    const { data: classification, error: classificationError } =
      await ClassificationRepository.saveClassification({
        ...parsed.data,
        user_id: userId,
        image_path: imagePath,
      })

    if (classificationError) {
      return res
        .status(HTTP_STATUS.INTERNAL_SERVER_ERROR)
        .json(
          failure(
            "Erro ao salvar classificação",
            ErrorCode.INTERNAL_SERVER_ERROR,
            [classificationError]
          )
        )
    }

    return res.json(
      success("Classificação realizada com sucesso", {
        classification,
      })
    )
  } catch (err) {
    next(err)
  }
}
