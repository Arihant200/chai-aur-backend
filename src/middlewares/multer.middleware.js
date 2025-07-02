import multer from "multer"
<<<<<<< HEAD

=======
 
>>>>>>> d18a9f5a8a045de0fd889b1383193f2b336c2b23

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./public/temp")
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname)
  }
})

export const upload = multer({ storage: storage })
