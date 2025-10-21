import { success } from "@/utils/response"
import { NextFunction, Request, Response } from "express"

export const home = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const response = success("API is running", {
      name: "ClassGrão API",
      version: "1.0.0",
      description:
        "API para classificação de grãos utilizando processamento de imagem.",
      authors: [
        {
          name: "Guilherme Felipe",
          github: "https://github.com/guilherme-felipe123",
          picture: "https://avatars.githubusercontent.com/u/115903669?v=4",
        },
        {
          name: "Luan Jacomini Kloh",
          github: "https://github.com/luanklo",
          picture: "https://avatars.githubusercontent.com/u/53999727?v=4",
        },
        {
          name: "Matheus Augusto",
          github: "https://github.com/Matheuz233",
          picture: "https://avatars.githubusercontent.com/u/138679799?v=4",
        },
      ],
    })

    return res.json(response)
  } catch (err) {
    return next(err)
  }
}
