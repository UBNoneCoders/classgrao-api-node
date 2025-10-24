import { ErrorCode, HTTP_STATUS, Roles } from "@/constants"
import ClassificationRepository from "@/repositories/classification-repository"
import { classifySchema, fileSchema } from "@/schemas/classify-schema"
import { triggerOpenCVProcessing } from "@/services/opencv-trigger-service"
import { registerAudit } from "@/utils/audit"
import { failure, success } from "@/utils/response"
import { NextFunction, Request, Response } from "express"
import fs from "fs"
import path from "path"
import PDFDocument from "pdfkit"

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
        has_classificated: false,
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

    const opencvProcessingResult = await triggerOpenCVProcessing()

    if (!opencvProcessingResult.success) {
      return res
        .status(
          opencvProcessingResult.status || HTTP_STATUS.INTERNAL_SERVER_ERROR
        )
        .json(
          failure(
            "Falha ao acionar processamento de imagem",
            ErrorCode.INTERNAL_SERVER_ERROR
          )
        )
    }

    await registerAudit({
      userId: userId,
      action: "CLASSIFICATION_SUCCESS",
      description: "Classificação realizada com sucesso",
      ipAddress: req.ip,
    })

    return res.json(
      success("Classificação realizada com sucesso", {
        classification,
      })
    )
  } catch (err) {
    next(err)
  }
}

export const getClassifications = async (
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

    if (req.user?.role === Roles.FARMER) {
      const { data: classifications, error: classificationError } =
        await ClassificationRepository.findByUserId(userId)

      if (classificationError) {
        return res
          .status(HTTP_STATUS.INTERNAL_SERVER_ERROR)
          .json(
            failure(
              "Erro ao buscar classificações",
              ErrorCode.INTERNAL_SERVER_ERROR,
              [classificationError]
            )
          )
      }

      return res.json(
        success("Classificações buscadas com sucesso", {
          classifications,
        })
      )
    }

    if (req.user?.role === Roles.ADMIN) {
      const { data: classifications, error: classificationError } =
        await ClassificationRepository.findAll()

      if (classificationError) {
        return res
          .status(HTTP_STATUS.INTERNAL_SERVER_ERROR)
          .json(
            failure(
              "Erro ao buscar classificações",
              ErrorCode.INTERNAL_SERVER_ERROR,
              [classificationError]
            )
          )
      }

      return res.json(
        success("Classificações buscadas com sucesso", {
          classifications,
        })
      )
    }
  } catch (err) {
    next(err)
  }
}

export const getClassificationById = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.user?.id
    const classificationId = Number(req.params.id)

    if (!userId) {
      return res
        .status(HTTP_STATUS.UNAUTHORIZED)
        .json(failure("Usuário não autenticado", ErrorCode.UNAUTHORIZED))
    }

    const { data: classification, error: classificationError } =
      await ClassificationRepository.findById(classificationId)

    if (classificationError) {
      return res
        .status(HTTP_STATUS.INTERNAL_SERVER_ERROR)
        .json(
          failure(
            "Erro ao buscar classificação",
            ErrorCode.INTERNAL_SERVER_ERROR,
            [classificationError]
          )
        )
    }

    if (!classification) {
      return res
        .status(HTTP_STATUS.NOT_FOUND)
        .json(failure("Classificação não encontrada", ErrorCode.NOT_FOUND))
    }

    if (classification.user_id !== userId && req.user?.role !== "admin") {
      return res
        .status(HTTP_STATUS.FORBIDDEN)
        .json(failure("Acesso negado à classificação", ErrorCode.FORBIDDEN))
    }

    return res.json(
      success("Classificação buscada com sucesso", {
        classification,
      })
    )
  } catch (err) {
    next(err)
  }
}

export const downloadClassificationReport = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const classificationId = Number(req.params.id)
    const userId = req.user?.id

    if (!userId) {
      return res
        .status(HTTP_STATUS.UNAUTHORIZED)
        .json(failure("Usuário não autenticado", ErrorCode.UNAUTHORIZED))
    }

    const { data: classification, error: classificationError } =
      await ClassificationRepository.findById(classificationId)

    if (classificationError || !classification) {
      return res
        .status(HTTP_STATUS.NOT_FOUND)
        .json(failure("Classificação não encontrada", ErrorCode.NOT_FOUND))
    }

    if (classification.user_id !== userId && req.user?.role !== Roles.ADMIN) {
      return res
        .status(HTTP_STATUS.FORBIDDEN)
        .json(failure("Acesso negado à classificação", ErrorCode.FORBIDDEN))
    }

    const pdfPath = path.join(
      process.cwd(),
      `temp/classification-${classification.id}.pdf`
    )

    fs.mkdirSync(path.dirname(pdfPath), { recursive: true })

    const doc = new PDFDocument()
    const stream = fs.createWriteStream(pdfPath)
    doc.pipe(stream)

    doc
      .fontSize(20)
      .text("Relatório de Classificação de Grãos", { align: "center" })
      .moveDown(1)

    doc
      .fontSize(14)
      .text(`Título: ${classification.title}`)
      .text(`Descrição: ${classification.description}`)
      .text(
        `Data de Criação: ${new Date(classification.created_at).toLocaleString(
          "pt-BR"
        )}`
      )
      .moveDown(1)

    if (classification.result) {
      const r = classification.result
      doc
        .fontSize(16)
        .text("Resultados da Análise:", { underline: true })
        .moveDown(0.5)

      doc
        .fontSize(12)
        .text(`Total de Grãos: ${r.total_grains}`)
        .text(`Total de Impurezas: ${r.total_impurities}`)
        .text(`% de Impurezas: ${r.impurities_percentage}%`)
        .text(`Área Média: ${r.average_area}`)
        .text(`Circularidade Média: ${r.average_circularity}`)
        .text(`Cor Média (BGR): ${r.average_color_bgr.join(", ")}`)
        .moveDown(1)
    }

    // 🔹 Imagem (se existir)
    if (classification.image_path) {
      try {
        const imageFullPath = path.join(
          process.cwd(),
          "uploads",
          classification.image_path
        )

        if (fs.existsSync(imageFullPath)) {
          doc.image(imageFullPath, {
            fit: [400, 300],
            align: "center",
            valign: "center",
          })
        }
      } catch (err) {
        console.error("Erro ao inserir imagem:", err)
      }
    }

    doc.end()

    stream.on("finish", () => {
      res.download(pdfPath, `classificacao-${classification.id}.pdf`, err => {
        if (err) console.error("Erro ao enviar PDF:", err)
        fs.unlinkSync(pdfPath)
      })
    })
  } catch (err) {
    next(err)
  }
}
