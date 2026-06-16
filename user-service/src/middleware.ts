import jwt, { JwtPayload } from "jsonwebtoken";
import User from "./model.js";
import { Request, NextFunction, Response } from "express";
import { IUser } from "./model.js";

export interface AuthenticatedUser extends Request {
    user?: IUser | null;
}

export const auth = async (req: AuthenticatedUser, res: Response, next: NextFunction): Promise<void> => {
    try {
        const authHeader = req.headers.authorization || (req.headers.token as string);
        const token = typeof authHeader === 'string' && authHeader.startsWith('Bearer ')
            ? authHeader.slice(7)
            : authHeader;

        if (!token) {
            res.status(401).json({ message: 'No token found' });
            return;
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as JwtPayload | string;
        if (typeof decoded !== 'object' || decoded === null) {
            res.status(403).json({ message: 'Invalid token' });
            return;
        }

        const userId = decoded.id || decoded._id;
        if (!userId || typeof userId !== 'string') {
            res.status(403).json({ message: 'Invalid token payload' });
            return;
        }

        const user = await User.findById(userId).select('-password');
        if (!user) {
            res.status(403).json({ message: 'Invalid user' });
            return;
        }

        req.user = user;
        next();
    } catch (error) {
        res.status(403).json({ message: 'Unauthorized' });
    }
};

export const isuser = async (req: AuthenticatedUser, res: Response, next: NextFunction): Promise<void> => {
    try {
        const user = req.user;
        if (!user) {
            res.status(403).json({ message: 'Missing authenticated user' });
            return;
        }
        if (user.role !== 'user') {
            res.status(403).json({ message: 'This route is for users only' });
            return;
        }
        next();
    } catch (error) {
        res.status(403).json({ message: 'Unauthorized' });
    }
};

export const isAdmin = async (req: AuthenticatedUser, res: Response, next: NextFunction): Promise<void> => {
    try {
        const user = req.user;
        if (!user || user.role !== 'admin') {
            res.status(403).json({ message: 'This route is for admins only' });
            return;
        }
        next();
    } catch (error) {
        res.status(403).json({ message: 'This route is for admins only' });
    }
};