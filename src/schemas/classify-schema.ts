import { z } from "zod"

export const classifySchema = z.object({
  title: z.string().min(3, "O título é muito curto"),
  description: z.string().min(5, "A descrição é muito curta"),
})

export const fileSchema = z.object({
  mimetype: z
    .string()
    .refine(val => ["image/jpeg", "image/jpg", "image/png"].includes(val), {
      message:
        "Tipo de arquivo inválido. Deve ser image/jpeg, image/jpg ou image/png",
    }),
  size: z.number().max(2 * 1024 * 1024, "O tamanho máximo é 2mb"),
})

export type ClassifySchema = z.infer<typeof classifySchema>
export type FileSchema = z.infer<typeof fileSchema>
