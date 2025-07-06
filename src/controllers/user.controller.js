import {asyncHandler} from "../utils/asynHandler.js"
import { ApiError } from "../utils/ApiError.js"
import {User} from "../models/user.model.js"
import { uploadOnCloudinary } from "../utils/cloudinary.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import path from "path";
import jwt from "jsonwebtoken"
const generateAcessAndRefreshTokens=async(userId)=>{
    try {
        const user=await User.findById(userId)
        const accessToken=user.generateAccessToken()
        const refreshToken=user.generateRefreshToken()
        user.refreshToken=refreshToken
        await user.save({validateBeforeSave:false})
        return {accessToken,refreshToken}

    } catch (error) {
        throw new ApiError(500,"something went wrong while generating refresh and access token")
    }
}

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
 const loginUser=asyncHandler(async(req,res)=>{
    //req body-bring data
    //username or email base login access
    //find the user
    //password check
    //if correct access and refresh token send
    //send cookies
    const {email,username,password}=req.body
    if (!(username || email)) {
        throw new ApiError(400,"username or email is required")
    }
   const user=await  User.findOne({
        $or:[{username},{email}]
    })
    if (!user) {
        throw new ApiError(404,"user does not exist")
    }
    const isPasswordValid=await user.isPasswordCorrect(password)
    if (!isPasswordValid) {
        throw new ApiError(401,"invalid user credentials")
    }
    const {accessToken,refreshToken}=await generateAcessAndRefreshTokens(user._id)
    const loggedInUser=await User.findById(user._id).select("-password -refreshToken")
     
    const options={
        httpOnly:true,
        secure:true
    }
    return res
    .status(200)
    .cookie("accessToken",accessToken,options)
    .cookie("refreshToken",refreshToken,options)
    .json(
        new ApiResponse(
            200,
            {
                user:loggedInUser,accessToken,refreshToken
            },
            "user logged in succesfully"
        )
    )
 })

 const logoutUser=(async(req,res)=>{
    await User.findByIdAndUpdate(
         req.user._id,
         {
            $set:{
                refreshToken:undefined
            }
         },
         {
            new:true
         }
    )
  
    const options={
        httpOnly:true,
        secure:true
    }

    return res
    .status(200)
    .clearCookie("accessToken",options)
    .clearCookie("refreshToken",options)
    .json(new ApiResponse(200,{},"user logged out"))
 })

 const refreshAccessToken=asyncHandler(async(req,res)=>{
   const incomingRefreshToken= req.cookies.refreshToken || req.body.refreshToken
   if (!incomingRefreshToken) {
    throw new ApiError(401,"unauthorized request")
   }
    const decodedToken= jwt.verify(incomingRefreshToken,process.env.REFRESH_TOKEN_SECRET)
    const user=await User.findById(decodedToken?._id)
    if (!user) { 
        throw new ApiError(401,"Invalid refresh token")
    }
    if (incomingRefreshToken!=user?.refreshToken) {
        throw new ApiError(401,"refresh token is expired or used")
    }
    const options={
        httpOnly:true,
        secure:true
    }
   const {accessToken,newRefreshToken}=await generateAcessAndRefreshTokens(user._id)
    return res.status(200)
    .cookie("accessToken",accessToken,options)//this line
    .cookie("refreshToken",newRefreshToken,options)
    .json(
        new ApiResponse(
            200,
            {accessToken,refreshToken:newRefreshToken},
            "Access token refreshed"
            
        )
    )
 })

 const changeCurrentPassword=asyncHandler(async(req,res)=>{
    const {oldPassword,newPassword}=req.body
   const user= await User.findById(req.user?._id)
   const isPasswordCorrect=await user.isPasswordCorrect(oldPassword)
   if (!isPasswordCorrect) {
    throw new ApiError(400,"Invalid old password")
   }
   user.password=newPassword
   await user.save({validateBeforeSave:false})

   return res
   .status(200)
   .json(new ApiResponse(200,{},"password changed succesfully"))

 })

 const getCurrentUser=asyncHandler(async(req,res)=>{
    return res
    .status(200)
    .json(200,req.user,"current user fetched succesfully")
 })

 const updateAcountDetails=asyncHandler(async(req,res)=>{
    const {fullname,email}=req.body
    if (!fullname || !email) {
        throw new ApiError(400,"All fields are required")
    }
    const user= User.findByIdAndUpdate(
        req.user?._id,
        {
            $set:{
                fullname,//or u can write fullname:fullname
                email
            }
        },
        {new:true}
    ).select("-password")
    return res
    .status(200)
    .json(new ApiResponse(200,user,"Account detials updated succesfully"))
 })

 const updateUserAvatar=asyncHandler(async(req,res)=>{
const avatarLocalPath=req.file?.path

    if (!avatarLocalPath) {
        throw new ApiError(400,"Avatar file is missing")
    }
    const avatar=await uploadOnCloudinary(avatarLocalPath)
    if (!avatar.url) {
        throw new ApiError(400,"Error while uploading on cloudinary")
    }
    const user=await User.findByIdAndUpdate(
        req.user?._id,
        {
            $set:{
                avatar:avatar.url
            }
        },
        {new:true}
    ).select("-password")

    return res
    .status(200)
    .json(new ApiResponse(200,user,"avatar uploaded succesfully"))
 })

  const updateUserCoverImage=asyncHandler(async(req,res)=>{
const coverLocalPath=req.file?.path

    if (!coverLocalPath) {
        throw new ApiError(400,"Cover file is missing")
    }
    const coverImage=await uploadOnCloudinary(coverLocalPath)
    if (!coverImage.url) {
        throw new ApiError(400,"Error while uploading on cloudinary")
    }
   const user= await User.findByIdAndUpdate(
        req.user?._id,
        {
            $set:{
                coverImage:coverImage.url
            }
        },
        {new:true}
    ).select("-password")

    return res
    .status(200)
    .json(new ApiResponse(200,user,"cover image uploaded succesfully"))
 })
export {
    registerUser,
    loginUser,
    logoutUser,
    refreshAccessToken,
    changeCurrentPassword,
     getCurrentUser,
     updateAcountDetails,
     updateUserAvatar,
     updateUserCoverImage
}