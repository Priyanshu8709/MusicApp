import getbuffer from "./config/datauri.js";
import TryCatch from "./trycatch.js";
import { Request } from "express";
import cloudinary from 'cloudinary';
import { sql } from "./config/db.js";
interface AuthenticatedRequest extends Request{
    user?:{
        _id:String,
        role:String
    }
}
export const addAdlbum = TryCatch(async(req:AuthenticatedRequest,res)=>{
    if(req.user?.role !== "admin"){
        res.status(403).json({message:"Authneticate first, You are not ADMIN"});
    }
    const {title,description}= req.body;
    const file = req.file;

    if(!title || !description || !file){
        return res.status(400).json({message:"all fields are rquired"});
    }
    const fileBuffer = getbuffer(file);
    if(!fileBuffer || !fileBuffer.content){
        return res.status(500).json({message:"failed to generate filebuffer"});
    }
    const cloud = await cloudinary.v2.uploader.upload(fileBuffer.content,{
        folder:process.env.FOLDER_NAME as string,
    });
    const result = await sql`
    INSERT INTO albums (title,description,thumbnail) VALUES (${title}, ${description}, ${cloud.secure_url}) 
    RETURNING *`;
    res.status(201).json({
        message:"albumb created",
        album:result[0],
    })
});