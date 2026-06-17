import { NextFunction, Request, Response } from "express";
import axios from 'axios';
import dotenv from 'dotenv';
dotenv.config();

interface IUser {
    _id: String
    email: string;
    password: string;
    name: string;
    role: 'user' | 'admin';
    playlists: String[];
}

interface AuthenticatedRequest extends Request{
    user?:IUser|null;
}
export const isAuth = async (req:AuthenticatedRequest,res:Response,next:NextFunction)
:Promise<void> => {
    try {
        const authHeader = req.headers.authorization || (req.headers.token as string);
        const token = typeof authHeader === 'string' && authHeader.startsWith('Bearer ')
            ? authHeader.slice(7)
            : authHeader;

        if (!token) {
            res.status(401).json({ message: 'No token found' });
            return;
        }
        const {data} = await axios.get(`${process.env.USER_URL}/api/v1/user/me`,{
            headers:{
                token,
            },
        });
        req.user=data;
        next();

    } catch (error) {
        res.status(403).json({message:"Authentication is required Login first"})
    }
}

//multer setup

import multer from 'multer';

const storage = multer.memoryStorage();

const uploadFile = multer({storage}).single("file");

export default uploadFile;