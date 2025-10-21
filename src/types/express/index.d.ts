import { User } from "@/types/user-type"

declare global {
  namespace Express {
    interface Request {
      user?: User
    }
  }
}
