import { Router } from "express"
import { home } from "@/controllers/index-controller"
import authRouter from "./auth-routes"

const rootRouter: Router = Router()

rootRouter.get("/", home)

rootRouter.use("/auth", authRouter)

export default rootRouter
