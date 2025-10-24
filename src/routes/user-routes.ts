import {
  createUser,
  deleteUser,
  getUserById,
  getUsers,
  updateUser,
} from "@/controllers/user-controller"
import authMiddleware from "@/middlewares/auth-middleware"
import { Router } from "express"

const userRoutes: Router = Router()

userRoutes.use(authMiddleware)

userRoutes.post("/", createUser)

userRoutes.get("/", getUsers)

userRoutes.get("/:id", getUserById)

userRoutes.put("/:id", updateUser)

userRoutes.delete("/:id", deleteUser)

export default userRoutes
