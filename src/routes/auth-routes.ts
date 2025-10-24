import { Router } from "express"
import { login, logout, me } from "@/controllers/auth-controller"
import authMiddleware from "@/middlewares/auth-middleware"

const authRoutes: Router = Router()

authRoutes.post("/login", login)

authRoutes.use(authMiddleware)

authRoutes.get("/me", me)

authRoutes.post("/logout", logout)

export default authRoutes
