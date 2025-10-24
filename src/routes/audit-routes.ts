import { getAuditLogById, getAuditLogs } from "@/controllers/audit-controller"
import authMiddleware from "@/middlewares/auth-middleware"
import { Router } from "express"

const auditLogsRoutes: Router = Router()

auditLogsRoutes.use(authMiddleware)

auditLogsRoutes.get("/", getAuditLogs)

auditLogsRoutes.get("/:id", getAuditLogById)

export default auditLogsRoutes
