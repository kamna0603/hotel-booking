import User from "../models/User.js"
import {webhook} from "svix";

const clerkWebHooks= async(req,res)=>{
    try {
        //create a svix instance with clerk webhook secret.
        const whook = new webhook(process.env.CLERK_WEBHOOK_SECRET)
        //getting headers
        const headers={
            "svix-id" : req.headers["svix-id"],
            "svix-timestamp" : req.headers["svix-timestamp"],
            "svix-signature" : req.headers["svix-signature"],
    }

    ///verifying headers
    await whook.verify(JSON.stringify(req.body),headers)

    //getting data from request body
    const{data,type}=req.body
    const userData={
        _id:data.id,
        email:data.email_addresses[0].email_address,
        username:data.first_name + " " + data.last_name,
        image:data.image_url,
    }

    //switch cases for different events
    switch(type){
        case "user.created":{
            await User.create(UserData)
            break;
        }
         case "user.updated":{
            await User.findByIdAndUpdate(data._id,UserData)
            break;
        }
         case "user.deleted":{
            await User.findByIdAndDelete(data._id)
            break;
        }
default:break;
    }

    res.json({success:true,
        message:"webhook Received"
    })

    } catch (error) {
        console.log(error.message);
        res.json({success:true,
            message:error.message
        });
    }
}
export default clerkWebHooks