import { ApiError } from "../utils/ApiError.js"
import { asyncHandler } from "../utils/asynHandler.js"
import jwt from "jsonwebtoken"
import { User } from "../models/user.model.js"

export const verifyJWT=asyncHandler(async(req,res,next)=>{
    try {
        const Token=req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ","")
    
        if (!Token) {
            throw new ApiError(401,"Unauthorized request")
        }
        const decodedToken=jwt.verify(Token,process.env.ACCESS_TOKEN_SECRET)
         const user=await User.findById(decodedToken?._id).select("-password -refreshToken")
         if (!user) {
            throw new ApiError(401,"Invalid Access token")
         }
         req.user=user;
         next()
    } catch (error) {
        throw new ApiError(401,"invalid access token")
    }
})