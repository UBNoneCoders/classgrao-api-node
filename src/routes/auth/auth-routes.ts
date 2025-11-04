import { login, logout, me } from "@/controllers/auth-controller"
import authMiddleware from "@/middlewares/auth-middleware"
import { Router } from "express"
import auditLogsRoutes from "./audit/audit-routes"
import classificationRoutes from "./classification/classification-routes"
import userRoutes from "./user/user-routes"

const authRoutes: Router = Router()

authRoutes.post("/login", login)

authRoutes.use(authMiddleware)

authRoutes.get("/me", me)

authRoutes.post("/logout", logout)

authRoutes.use("/classifications", classificationRoutes)

authRoutes.use("/audits", auditLogsRoutes)

authRoutes.use("/users", userRoutes)

export default authRoutes
