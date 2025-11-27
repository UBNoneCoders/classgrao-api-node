import {
  classifyGrain,
  deleteClassification,
  downloadClassificationReport,
  getClassificationById,
  getClassifications,
  reprocessClassification,
} from "@/controllers/classification-controller"
import authMiddleware from "@/middlewares/auth-middleware"
import { uploadSingleImage } from "@/middlewares/multer-middleware"
import { Router } from "express"

const classificationRoutes: Router = Router()

classificationRoutes.use(authMiddleware)

classificationRoutes.post("/", uploadSingleImage, classifyGrain)

classificationRoutes.post("/:id/reprocess", reprocessClassification)

classificationRoutes.get("/", getClassifications)

classificationRoutes.get("/:id", getClassificationById)

classificationRoutes.get("/:id/report", downloadClassificationReport)

classificationRoutes.delete("/:id", deleteClassification)

export default classificationRoutes
