import { home } from "@/controllers/index-controller"
import { Router } from "express"

import authRouter from "./auth/auth-routes"

const rootRouter: Router = Router()

rootRouter.get("/", home)

rootRouter.use("/auth", authRouter)

export default rootRouter
