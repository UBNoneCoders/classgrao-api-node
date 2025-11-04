import bcrypt from "bcrypt"

export const hashPassword = async (password: string): Promise<string> => {
  const rounds = 12
  return await bcrypt.hash(password, rounds)
}
