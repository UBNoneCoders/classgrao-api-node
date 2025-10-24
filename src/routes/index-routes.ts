import { home } from "@/controllers/index-controller"
import { Router } from "express"
import authRouter from "./auth-routes"
import classificationRoutes from "./classification-routes"
import auditLogsRoutes from "./audit-logs"

const rootRouter: Router = Router()

rootRouter.get("/", home)

rootRouter.use("/auth", authRouter)

rootRouter.use("/classifications", classificationRoutes)

rootRouter.use("/audit-logs", auditLogsRoutes)

export default rootRouter