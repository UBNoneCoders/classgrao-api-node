import { z } from "zod"

export const createUserSchema = z.object({
  username: z
    .string({ message: "Nome de usuário é obrigatório" })
    .min(3, "Nome de usuário deve ter no mínimo 3 caracteres")
    .max(50, "Nome de usuário deve ter no máximo 50 caracteres")
    .trim(),
  password: z
    .string({ message: "Senha é obrigatória" })
    .min(6, "Senha deve ter no mínimo 6 caracteres")
    .max(100, "Senha deve ter no máximo 100 caracteres"),
  name: z
    .string({ message: "Nome é obrigatório" })
    .min(3, "Nome deve ter no mínimo 3 caracteres")
    .max(100, "Nome deve ter no máximo 100 caracteres")
    .trim(),
})

export const updateUserSchema = z.object({
  username: z
    .string()
    .min(3, "Nome de usuário deve ter no mínimo 3 caracteres")
    .max(50, "Nome de usuário deve ter no máximo 50 caracteres")
    .trim()
    .optional(),
  password: z
    .string()
    .min(6, "Senha deve ter no mínimo 6 caracteres")
    .max(100, "Senha deve ter no máximo 100 caracteres")
    .optional(),
  name: z
    .string()
    .min(3, "Nome deve ter no mínimo 3 caracteres")
    .max(100, "Nome deve ter no máximo 100 caracteres")
    .trim()
    .optional(),
  active: z.boolean().optional(),
})

export type CreateUserInput = z.infer<typeof createUserSchema>
export type UpdateUserInput = z.infer<typeof updateUserSchema>
