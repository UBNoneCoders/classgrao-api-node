import { supabase } from "@/config/supabase"

interface AuditLog {
  userId?: string | null
  action: string
  description: string
  ipAddress?: string | null
}

export const registerAudit = async ({
  userId = null,
  action,
  description,
  ipAddress = null,
}: AuditLog): Promise<void> => {
  try {
    await supabase.from("audit_logs").insert({
      user_id: userId ? parseInt(userId) : null,
      action,
      description,
      ip_address: ipAddress,
    })
  } catch (err) {
    console.error("Error:", err)
  }
}
