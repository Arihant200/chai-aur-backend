// require('dotenv').config({path:'.env'})
import 'dotenv/config'; 

import connectDB from "./db/index.js";
import {app} from "./app.js";




connectDB()
.then(()=>{
    app.listen(process.env.PORT || 8000,()=>{
        console.log(`server is running at PORT ${process.env.PORT}`)
    })
    
})
.catch((err)=>{
    console.log("MONGO db connection failed !!!",err)
})








// import express, { application } from "express"
//const app =express()
//  ;(async()=>{
//     try{
//        await mongoose.connect(`${process.env.MONGODB_URI}/${DB_name}`)
//        application.on("error",(error)=>{
//         console.log("error",error);
//         throw error
//        })
//        app.listen(process.env.PORT,()=>{
//         console.log(`app is listening on port ${process.env.PORT}` );
//        })
//     }catch(error){
//         console.log("ERROR:",error)
//     }
//  })()

 