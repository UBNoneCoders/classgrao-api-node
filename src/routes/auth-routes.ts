import { Router } from "express"
import { login, me } from "@/controllers/auth-controller"
import authMiddleware from "@/middlewares/auth-middleware"

const authRoutes: Router = Router()

authRoutes.post("/login", login)

authRoutes.use(authMiddleware)

authRoutes.get("/me", me)

export default authRoutes
