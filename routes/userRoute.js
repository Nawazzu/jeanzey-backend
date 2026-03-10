import express from 'express';
import { loginUser, registerUser, adminLogin, sendWelcomeEmail } from '../controllers/userController.js';

const userRouter = express.Router();

userRouter.post('/register', registerUser)
userRouter.post('/login', loginUser)
userRouter.post('/admin', adminLogin)
userRouter.post('/welcome-email', sendWelcomeEmail)

export default userRouter;