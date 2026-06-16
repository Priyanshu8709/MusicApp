import express, { NextFunction, RequestHandler, Request, Response } from 'express';
import { registerUser, loginUser, myProfile} from './controller.js';
import { auth, isuser} from './middleware.js';

const router = express.Router();


router.post('/user/register', registerUser);
router.post('/user/login', loginUser);
router.get("/user/me",auth,isuser,myProfile);
export default router;