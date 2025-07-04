import multer from "multer"

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
     console.log("📦 Saving file to ./public/temp"); // debug
    cb(null, "./public/temp")
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname)
  }
})


export const upload = multer({ storage: storage })
