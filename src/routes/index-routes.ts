import { home } from "@/controllers/index-controller"
import { Router } from "express"
import auditLogsRoutes from "./audit-logs"
import authRouter from "./auth-routes"
import classificationRoutes from "./classification-routes"
import userRoutes from "./user-routes"

const rootRouter: Router = Router()

rootRouter.get("/", home)

rootRouter.use("/auth", authRouter)

rootRouter.use("/classifications", classificationRoutes)

rootRouter.use("/audit-logs", auditLogsRoutes)

rootRouter.use("/users", userRoutes)

export default rootRouter
