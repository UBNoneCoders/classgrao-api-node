import { supabase } from "@/config/supabase"
import { Classification } from "@/types/classification-type"
import * as crypto from "crypto"

export default class ClassificationRepository {
  static async findById(id: number) {
    const { data: classification, error: classificationError } = await supabase
      .from("classifications")
      .select("*")
      .eq("id", id)
      .single()

    if (classificationError) {
      return { data: null, error: classificationError }
    }

    return { data: classification, error: null }
  }

  static async findByUserId(userId: string) {
    const { data: classifications, error: classificationError } = await supabase
      .from("classifications")
      .select("*")
      .eq("user_id", userId)

    if (classificationError) {
      return { data: null, error: classificationError }
    }

    return { data: classifications, error: null }
  }

  static async findAll() {
    const { data: classifications, error: classificationError } = await supabase
      .from("classifications")
      .select("*")

    if (classificationError) {
      return { data: null, error: classificationError }
    }

    return { data: classifications, error: null }
  }

  static async saveClassification(data: Classification) {
    const { data: classification, error: classificationError } = await supabase
      .from("classifications")
      .insert(data)
      .select()
      .single()

    if (classificationError) {
      return { data: null, error: classificationError }
    }

    return { data: classification, error: null }
  }

  static async saveImage(file: Express.Multer.File) {
    const hash = crypto.randomBytes(8).toString("hex")
    const ext = file.originalname.split(".").pop()

    const fileName = `${hash}.${ext}`

    const { data: uploadData, error: uploadError } = await supabase.storage
      .from("classification-images")
      .upload(fileName, file.buffer, {
        contentType: file.mimetype,
      })

    if (uploadError) {
      return { data: null, error: uploadError }
    }

    return { data: uploadData.fullPath, error: null }
  }

  static async deleteClassification(id: number) {
    const { data, error } = await supabase
      .from("classifications")
      .delete()
      .eq("id", id)

    if (error) {
      return { data: null, error }
    }

    return { data, error: null }
  }
}
