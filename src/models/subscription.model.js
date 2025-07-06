import mongoose,{Schema} from "mongoose";
import { use } from "react";

const subscriptionSchema=new Schema({
    subsriber:{
        types:Schema.Types.ObjectId,//one who is subscribing
        ref:"User"
    },
    channel:{
        type:Schema.Types.ObjectId,//channel being subscribed to
        ref:"User"  
    }

},{
    timestamps:true
})

export const Subscription=mongoose.model("Subscription",subscriptionSchema)