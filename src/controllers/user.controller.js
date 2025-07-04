import {asyncHandler} from "../utils/asynHandler.js"
import { ApiError } from "../utils/ApiError.js"
import {User} from "../models/user.model.js"
import { uploadOnCloudinary } from "../utils/cloudinary.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import fs from "fs";
import path from "path";
console.log("✅ Loaded Cloudinary config:", {
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET ? "loaded" : "missing"
});


const registerUser=asyncHandler( async (req,res)=>{
    //get user detial from frontend using postman in dev phase
    //validation -not empty
    //check if user already exists:username,email
    //check for images,check for avatar
    //upload them to cloudinary,check if its uploaded
    //create user object-create entry in db
    //remove password and refresh token field from response
    //check for user creation
    //return res 
    

console.log("bye")
    const {fullname,email,username,password}=req.body
   console.log('req.body:', req.body);
console.log('req.files:', req.files);

    if ([fullname,email,username,password].some((field)=>
field?.trim()==="")
     ) {
        throw new ApiError(400,"All fields are required")
    }
    const existedUser=await User.findOne({
        $or:[{username},{email}]
    })
    if (existedUser) {
        throw new ApiError(409,"User with email or username already exists")
    }
    const avatarLocalPath = req.files?.avatar?.[0]?.path;
const coverImageLocalPath = req.files?.coverImage?.[0]?.path;

   if (!avatarLocalPath) {
    throw new ApiError(400,"Avatar file is required,please jupload it")
   }
  


const avatarAbsolutePath = path.resolve(avatarLocalPath);
   const avatar = await uploadOnCloudinary(avatarAbsolutePath);
console.log("Absolute path:", avatarAbsolutePath);

  const coverImage= await uploadOnCloudinary(coverImageLocalPath)
  console.log('req.files:', req.files);
console.log('avatarLocalPath:', avatarLocalPath);

   if (!avatar) {
     throw new ApiError(400,"Avatar file is required on cloudinary")
   }
   const user=await User.create({
    fullname,
    avatar:avatar.url,
    coverImage:coverImage?.url||"",
    email,
    password,
    username:username.toLowerCase()
   })
   const createdUser=await User.findById(user._id).select(
    "-password -refreshToken"
   )
   if (!createdUser) {
    throw new ApiError(500,"Something went wrong while registering the user")
   }
    return res.status(201).json(
        new ApiResponse(200,createdUser,"User registered succesfully")
    )
})

export {registerUser}