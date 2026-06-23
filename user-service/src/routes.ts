import express, { NextFunction, RequestHandler, Request, Response } from 'express';
import { registerUser, loginUser, myProfile, updatePassword, updateProfile, deleteUser} from './controller.js';
import { auth } from './middleware.js';

const router = express.Router();


router.post('/user/register', registerUser);
router.post('/user/login', loginUser);
router.get("/user/me", auth, myProfile);
router.get("/profile", auth, myProfile);
router.put("/user/me/update", auth, updateProfile);
router.put("/user/me/password", auth, updatePassword);
router.delete("/user/me/delete", auth, deleteUser);
export default router;