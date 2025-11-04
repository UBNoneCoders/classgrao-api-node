import {
  classifyGrain,
  downloadClassificationReport,
  getClassificationById,
  getClassifications,
} from "@/controllers/classification-controller"
import authMiddleware from "@/middlewares/auth-middleware"
import { uploadSingleImage } from "@/middlewares/multer-middleware"
import { Router } from "express"

const classificationRoutes: Router = Router()

classificationRoutes.use(authMiddleware)

classificationRoutes.post("/", uploadSingleImage, classifyGrain)

classificationRoutes.get("/", getClassifications)

classificationRoutes.get("/:id", getClassificationById)

classificationRoutes.get("/:id/report", downloadClassificationReport)

export default classificationRoutes
