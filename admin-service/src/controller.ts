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
export const addAlbum = TryCatch(async(req:AuthenticatedRequest,res)=>{
    if(req.user?.role !== "admin"){
        return res.status(403).json({message:"Authenticate first, You are not ADMIN"});
    }
    const {title,description}= req.body;
    const file = req.file;

    if(!title || !description || !file){
        return res.status(400).json({message:"all fields are required"});
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
        message:"album created",
        album:result[0],
    })
});

export const addSong = TryCatch(async(req:AuthenticatedRequest, res)=>{
    if(req.user?.role !== "admin"){
        return res.status(403).json({message:"Authenticate first, You are not the admin"});
    }
    const {title,description,album_id} = req.body;
    const file = req.file;
    if(!title || !description || !file || !album_id){
        return res.status(400).json({message:"All fileds are required"});
    }
    const album = await sql`
    SELECT * FROM albums WHERE id = ${album_id}`;
    if(album.length === 0){
        return res.status(404).json({message:"Album not found"});
    }
    const fileBuffer = getbuffer(file);
    if(!fileBuffer || !fileBuffer.content){
        return res.status(500).json({message:"Problem in Buffer"});
    }
    const cloud = await cloudinary.v2.uploader.upload(fileBuffer.content,{
        folder:"songs",
        resource_type:"video"
    });

    const result = await sql`
    INSERT INTO songs (title,description,audio,album_id) VALUES
     (${title},${description},${cloud.secure_url},${album_id}) RETURNING *`;
     return res.status(201).json({message:"song created successfully", song: result[0]});
});

export const addThumbnail = TryCatch(async(req:AuthenticatedRequest,res)=>{
     if(req.user?.role !== "admin"){
        return res.status(403).json({message:"Authenticate first, You are not the admin"});
    }
    const song = await sql`
    SELECT * FROM songs WHERE id = ${req.params.id}`;
    if(song.length === 0){
        return res.status(404).json({message:"Song Not found"});
    }
    const file = req.file;
    if(!file){
        return res.status(404).json({message:"no file to upload"});
    }
    const fileBuffer = getbuffer(file);
    if(!fileBuffer || !fileBuffer.content){
        return res.status(500).json({message:"Problem in Buffer"});
    }
    const cloud = await cloudinary.v2.uploader.upload(fileBuffer.content,{
        folder:"thumbnail",
        resource_type:"image"
    });
    const result = await sql`
    UPDATE songs SET thumbnail = ${cloud.secure_url} WHERE id = ${req.params.id} RETURNING *`;
    return res.status(200).json({message:"Thumbnail is Added",song:result[0]});

});

export const deleteAlbum = TryCatch(async(req:AuthenticatedRequest,res)=>{
    if(req.user?.role !== "admin"){
        return res.status(403).json({message:"You are not the Admin"});
    }
    const {id} = req.params;
    const album = await sql`
    SELECT * FROM albums WHERE id = ${id}`;
    if(album.length === 0){
        return res.status(404).json({message:"Album not found"});
    }
    await sql`
    DELETE FROM songs WHERE album_id = ${id}`;
    await sql`
    DELETE FROM albums WHERE id = ${id}`;

    return res.status(200).json({message:"Album has been successfully Deleted"});
});

export const deleteSong = TryCatch(async(req:AuthenticatedRequest,res)=>{
    if(req.user?.role !== "admin"){
        return res.status(403).json({message:"You are not the Admin"});
    }
    const {id} = req.params;
    const song = await sql`
    SELECT * FROM songs WHERE id = ${id}`;
    if(song.length === 0){
        return res.status(404).json({message:"Song not found"});
    }
    await sql`
    DELETE FROM songs WHERE id = ${id}`;
    return res.status(200).json({message:"song deleted successfully"});
});

