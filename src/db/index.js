import mongoose from "mongoose";
import { DB_name } from "../constant.js";

const connectDB=async()=>{
    try {
        const connectionInstance=await mongoose.connect(`${process.env.MONGODB_URI}/${DB_name}`)
        console.log(`\n MongoDB connected :${connectionInstance.connection.host}`)
    } catch (error) {
        console.log("MONGODB failed to connect",error);
        process.exit(1)
    }
}
export  default connectDB