import { z } from "zod"

const authSchema = {
  login: z.object({
    username: z
      .string({
        message: "O nome de usuário deve ser uma string",
      })
      .min(1, { message: "O nome de usuário deve ter pelo menos 1 caractere" })
      .max(15, {
        message: "O nome de usuário deve ter no máximo 30 caracteres",
      })
      .regex(/^[a-zA-Z0-9]+$/, {
        message: "O nome de usuário deve conter apenas letras e números",
      }),
    password: z
      .string({ message: "A senha deve ser uma string" })
      .min(6, { message: "A senha deve ter pelo menos 6 caracteres" }),
  }),
}

export default authSchema
