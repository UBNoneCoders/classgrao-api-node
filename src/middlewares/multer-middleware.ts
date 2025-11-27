import multer from "multer"

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 50 * 1024 * 1024, // 50mb
  },
  fileFilter: (req, file, cb) => {
    const allowed = ["image/jpeg", "image/jpg", "image/png"]
    if (!allowed.includes(file.mimetype)) {
      return cb(new Error("Tipo de imagem inválido"))
    }
    cb(null, true)
  },
})

export const uploadSingleImage = upload.single("image")
