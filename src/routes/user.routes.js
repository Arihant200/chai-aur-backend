import { Router } from "express";
import { registerUser } from "../controllers/user.controller.js";



import {upload} from "../middlewares/multer.middleware.js"
const router=Router();
router.route("/register").post(
    upload.fields([
        {
            name:"avatar",
            maxCount:1
        },
        {
            name:"coverImage",
            maxCount:1
        }
    ]),
    (req, res, next) => {
        console.log("reached here")
    console.log("✅ req.files:", req.files);
    console.log("✅ req.body:", req.body);
    next();
  },
    registerUser
)

export default router