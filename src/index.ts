import express from "express"
import { PORT } from "./config"
import { ErrorCode, HTTP_STATUS } from "./constants"
import { errorMiddleware } from "./middlewares/error-middleware"

import rootRouter from "./routes/api-routes"
import { failure, success } from "./utils/response"

const app = express()

app.use(express.json())

app.use("/api", rootRouter)

app.get("/", (req, res) => {
  res
    .status(HTTP_STATUS.OK)
    .json(
      success(
        "API ClassGrão funcionando! Acesse /api para as rotas. O download da coleção Postman se encontra em /docs."
      )
    )
})

app.get("/docs", (req, res) => {
  const filePath = `${process.cwd()}/docs/classgrao_api.postman_collection.json`

  res.download(filePath, "classgrao_api.postman_collection.json", err => {
    if (err) {
      console.error("Erro ao enviar o arquivo:", err)
      return res
        .status(HTTP_STATUS.INTERNAL_SERVER_ERROR)
        .json(
          failure(
            "Não foi possível baixar o arquivo.",
            ErrorCode.INTERNAL_SERVER_ERROR
          )
        )
    }
  })
})

app.listen(PORT, () => {
  console.log(`O servidor está rodando na porta ${PORT}`)
})

app.use(errorMiddleware)
