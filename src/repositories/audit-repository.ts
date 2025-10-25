import { supabase } from "@/config/supabase"

export default class AuditRepository {
  static async findAll() {
    const { data: audits, error: auditError } = await supabase
      .from("audit_logs")
      .select("*")

    if (auditError) {
      return { data: null, error: auditError }
    }

    return { data: audits, error: null }
  }

  static async findByUserId(userId: string) {
    const { data: audits, error: auditError } = await supabase
      .from("audit_logs")
      .select("*")
      .eq("user_id", userId)

    if (auditError) {
      return { data: null, error: auditError }
    }

    return { data: audits, error: null }
  }

  static async findById(id: string) {
    const { data: audit, error: auditError } = await supabase
      .from("audit_logs")
      .select("*")
      .eq("id", id)
      .single()

    if (auditError) {
      return { data: null, error: auditError }
    }

    return { data: audit, error: null }
  }
}
