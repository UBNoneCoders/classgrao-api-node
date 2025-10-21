import dotenv from "dotenv"
import type { Secret, SignOptions } from "jsonwebtoken"

dotenv.config()

export const PORT = process.env.PORT || 3000
export const JWT_SECRET: Secret = process.env.JWT_SECRET!
export const JWT_EXPIRES_IN: SignOptions["expiresIn"] = (process.env
  .JWT_EXPIRES_IN ?? "31d") as SignOptions["expiresIn"]
