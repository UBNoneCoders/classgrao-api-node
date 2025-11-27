import fs from "fs"
import http from "http"
import https from "https"
import path from "path"
import PDFDocument from "pdfkit"

interface PDFColors {
  primary: string
  secondary: string
  accent: string
  text: string
  lightGray: string
}

interface ClassificationData {
  id: number
  title: string
  description: string
  created_at: string
  result?: {
    total_grains: number
    good_grains: number
    bad_grains: number
    good_grains_percentage: number
    average_area: number
    average_circularity: number
    average_color: number[]
  }
  result_image_path?: string
}

const downloadImage = (url: string, destPath: string): Promise<void> => {
  return new Promise((resolve, reject) => {
    const protocol = url.startsWith("https") ? https : http
    const file = fs.createWriteStream(destPath)

    protocol
      .get(url, response => {
        if (response.statusCode !== 200) {
          reject(new Error(`Failed to download image: ${response.statusCode}`))
          return
        }

        response.pipe(file)

        file.on("finish", () => {
          file.close()
          resolve()
        })
      })
      .on("error", err => {
        fs.unlink(destPath, () => {})
        reject(err)
      })

    file.on("error", err => {
      fs.unlink(destPath, () => {})
      reject(err)
    })
  })
}

export class ClassificationPDFService {
  private colors: PDFColors = {
    primary: "#2C5F2D",
    secondary: "#97BC62",
    accent: "#F4A261",
    text: "#2D3748",
    lightGray: "#F7FAFC",
  }

  async generatePDF(
    classification: ClassificationData,
    outputPath: string
  ): Promise<void> {
    return new Promise(async (resolve, reject) => {
      try {
        const doc = new PDFDocument({
          size: "A4",
          margins: { top: 50, bottom: 50, left: 50, right: 50 },
        })

        const stream = fs.createWriteStream(outputPath)
        doc.pipe(stream)

        this.addHeader(doc)
        let yPosition = this.addGeneralInfo(doc, classification, 150)
        yPosition = this.addAnalysisResults(doc, classification, yPosition)

        await this.addProcessedImage(doc, classification, yPosition)

        this.addFooter(doc, classification)
        doc.end()

        stream.on("finish", () => resolve())
        stream.on("error", reject)
      } catch (error) {
        reject(error)
      }
    })
  }

  private addHeader(doc: PDFKit.PDFDocument): void {
    doc.rect(0, 0, doc.page.width, 120).fill(this.colors.primary)

    doc
      .fontSize(28)
      .fillColor("#FFFFFF")
      .font("Helvetica-Bold")
      .text("Relatório de Classificação", 50, 35, { align: "center" })
      .fontSize(16)
      .font("Helvetica")
      .text("Análise de Grãos", 50, 70, { align: "center" })

    doc
      .moveTo(50, 110)
      .lineTo(doc.page.width - 50, 110)
      .lineWidth(3)
      .strokeColor(this.colors.accent)
      .stroke()

    doc.fillColor(this.colors.text)
  }

  private addGeneralInfo(
    doc: PDFKit.PDFDocument,
    classification: ClassificationData,
    yPosition: number
  ): number {
    doc
      .roundedRect(50, yPosition, doc.page.width - 100, 110, 5)
      .fillAndStroke(this.colors.lightGray, "#E2E8F0")

    doc
      .fontSize(16)
      .fillColor(this.colors.primary)
      .font("Helvetica-Bold")
      .text("Informações Gerais", 65, yPosition + 15)

    doc
      .fontSize(11)
      .fillColor(this.colors.text)
      .font("Helvetica")
      .text(`Título:`, 65, yPosition + 45, { continued: true })
      .font("Helvetica-Bold")
      .text(` ${classification.title}`)

    doc
      .font("Helvetica")
      .text(`Descrição:`, 65, yPosition + 62, { continued: true })
      .font("Helvetica-Bold")
      .text(` ${classification.description}`)

    doc
      .font("Helvetica")
      .text(`Data de Criação:`, 65, yPosition + 79, { continued: true })
      .font("Helvetica-Bold")
      .text(` ${new Date(classification.created_at).toLocaleString("pt-BR")}`)

    return yPosition + 140
  }

  private addAnalysisResults(
    doc: PDFKit.PDFDocument,
    classification: ClassificationData,
    yPosition: number
  ): number {
    if (!classification.result) return yPosition

    const r = classification.result

    doc
      .fontSize(18)
      .fillColor(this.colors.primary)
      .font("Helvetica-Bold")
      .text("Resultados da Análise", 50, yPosition)

    yPosition += 30

    yPosition = this.addMetricCards(doc, r, yPosition)
    yPosition = this.addDetailedMetrics(doc, r, yPosition)

    return yPosition
  }

  private addMetricCards(
    doc: PDFKit.PDFDocument,
    result: any,
    yPosition: number
  ): number {
    const metrics = [
      {
        label: "Total de Grãos",
        value: result.total_grains,
        color: this.colors.primary,
      },
      {
        label: "Grãos Bons",
        value: result.good_grains,
        color: this.colors.secondary,
      },
      {
        label: "Grãos Defeituosos",
        value: result.bad_grains,
        color: "#E53E3E",
      },
      {
        label: "% Grãos Bons",
        value: `${result.good_grains_percentage}%`,
        color: this.colors.accent,
      },
    ]

    const boxWidth = (doc.page.width - 130) / 2
    const boxHeight = 70
    let xPos = 50
    let yPos = yPosition

    metrics.forEach((metric, index) => {
      if (index === 2) {
        xPos = 50
        yPos += boxHeight + 15
      }

      doc
        .roundedRect(xPos, yPos, boxWidth, boxHeight, 5)
        .fillAndStroke("#FFFFFF", "#E2E8F0")

      doc.circle(xPos + 20, yPos + 35, 8).fill(metric.color)

      doc
        .fontSize(10)
        .fillColor("#718096")
        .font("Helvetica")
        .text(metric.label, xPos + 40, yPos + 20, { width: boxWidth - 50 })

      doc
        .fontSize(24)
        .fillColor(metric.color)
        .font("Helvetica-Bold")
        .text(String(metric.value), xPos + 40, yPos + 35, {
          width: boxWidth - 50,
        })

      xPos += boxWidth + 15
    })

    return yPos + boxHeight + 30
  }

  private addDetailedMetrics(
    doc: PDFKit.PDFDocument,
    result: any,
    yPosition: number
  ): number {
    doc
      .fontSize(14)
      .fillColor(this.colors.primary)
      .font("Helvetica-Bold")
      .text("Métricas Detalhadas", 50, yPosition)

    yPosition += 25

    doc
      .roundedRect(50, yPosition, doc.page.width - 100, 95, 5)
      .fillAndStroke(this.colors.lightGray, "#E2E8F0")

    const detailedMetrics = [
      { label: "Área Média", value: result.average_area.toFixed(2) },
      {
        label: "Circularidade Média",
        value: result.average_circularity.toFixed(2),
      },
      { label: "Cor Média (RGB)", value: result.average_color.join(", ") },
    ]

    let detailY = yPosition + 15

    detailedMetrics.forEach(metric => {
      doc
        .fontSize(10)
        .fillColor("#718096")
        .font("Helvetica")
        .text(metric.label, 65, detailY)

      doc
        .fontSize(11)
        .fillColor(this.colors.text)
        .font("Helvetica-Bold")
        .text(String(metric.value), 250, detailY)

      detailY += 25
    })

    return yPosition + 120
  }

  private async addProcessedImage(
    doc: PDFKit.PDFDocument,
    classification: ClassificationData,
    yPosition: number
  ): Promise<void> {
    if (!classification.result_image_path) return

    try {
      if (yPosition > doc.page.height - 400) {
        doc.addPage()
        yPosition = 50
      }

      doc
        .fontSize(18)
        .fillColor(this.colors.primary)
        .font("Helvetica-Bold")
        .text("Imagem Processada", 50, yPosition)

      yPosition += 30

      const resultImageUrl = `${process.env.SUPABASE_URL}/storage/v1/object/public/${classification.result_image_path}`

      const tempDir = path.join(process.cwd(), "temp")
      if (!fs.existsSync(tempDir)) {
        fs.mkdirSync(tempDir, { recursive: true })
      }

      const tempResultImagePath = path.join(
        tempDir,
        `result-${classification.id}-${Date.now()}.jpg`
      )

      await downloadImage(resultImageUrl, tempResultImagePath)

      const imgWidth = 450
      const imgHeight = 350
      const imgX = (doc.page.width - imgWidth) / 2

      doc
        .roundedRect(
          imgX - 10,
          yPosition - 10,
          imgWidth + 20,
          imgHeight + 20,
          5
        )
        .fillAndStroke("#FFFFFF", "#E2E8F0")

      doc.image(tempResultImagePath, imgX, yPosition, {
        fit: [imgWidth, imgHeight],
        align: "center",
      })

      fs.unlinkSync(tempResultImagePath)
    } catch (err) {
      console.error("Erro ao inserir imagem processada:", err)
    }
  }

  private addFooter(
    doc: PDFKit.PDFDocument,
    classification: ClassificationData
  ): void {
    const footerY = doc.page.height - 40
    doc
      .fontSize(9)
      .fillColor("#A0AEC0")
      .font("Helvetica")
      .text(
        `Gerado em ${new Date().toLocaleString("pt-BR")} | Classificação ID: ${
          classification.id
        }`,
        50,
        footerY,
        { align: "center", width: doc.page.width - 100 }
      )
  }
}
