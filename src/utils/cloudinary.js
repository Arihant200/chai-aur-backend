



import {v2 as cloudinary} from "cloudinary"


import fs from  "fs"


cloudinary.config({ 
        cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
        api_key: process.env.CLOUDINARY_API_KEY, 
        api_secret: process.env.CLOUDINARY_API_SECRET
    });
console.log("✅ Loaded Cloudinary config:", {
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET ? "loaded" : "missing"
});


const uploadOnCloudinary=async (localFilePath)=>{
try {
    console.log("gg1")
    if (!localFilePath){ console.log("gg")
        return null}//upload file on cloudinary
    const response=await cloudinary.uploader.upload(localFilePath,{
        resource_type:"auto"
    })
    console.log("gg2")
    //file has been uploaded succesfully
    console.log("file has been uploaded succesfully",response.url)
    fs.unlinkSync(localFilePath)
    return response
} catch (error) {
    fs.existsSync(localFilePath) && fs.unlinkSync(localFilePath)
//remove the locally saved temporary file as upload operation got failed
console.log("failed to upload")
    return null
}
}

export {uploadOnCloudinary}
