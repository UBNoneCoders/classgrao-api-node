import express from "express"
import { PORT } from "./config"
import { errorMiddleware } from "./middlewares/error-middleware"
import rootRouter from "./routes/index-routes"

const app = express()

app.use(express.json())

app.use("/api", rootRouter)

app.listen(PORT, () => {
  console.log(`O servidor está rodando na porta ${PORT}`)
})

app.get("/", (req, res) => {
  res.status(200).json({
    message:
      "API ClassGrão funcionando! Acesse /api para as rotas ou /docs para a documentação.",
  })
})

app.use(errorMiddleware)
