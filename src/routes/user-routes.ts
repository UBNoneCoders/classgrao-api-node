import {
  createUser,
  deleteUser,
  getUserById,
  getUsers,
  toggleUserStatus,
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

userRoutes.patch("/:id/toggle-status", toggleUserStatus)

userRoutes.delete("/:id", deleteUser)

export default userRoutes
