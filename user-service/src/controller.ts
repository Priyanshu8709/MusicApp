import TryCatch from "./trycatch.js";
import User from "./model.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { AuthenticatedUser } from "./middleware.js";

export const registerUser = TryCatch(async (req, res) => {
    const { email, password, name } = req.body;
    if (!email || !password || !name) {
        return res.status(400).json({ message: 'Email, password, and name are required' });
    }
    const user = await User.findOne({ email });
    if (user) {
        return res.status(400).json({ message: 'User already exists' });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({ email, password: hashedPassword, name, playlists: [] });
    await newUser.save();
    res.status(201).json({ message: 'User created successfully' });
});

export const loginUser = TryCatch(async (req, res) => {
    const { email, password } = req.body;
    
    if (!email || !password) {
        return res.status(400).json({ message: 'Email and password are required' });
    }
    
    const user = await User.findOne({ email });
    if (!user) {
        return res.status(401).json({ message: 'Invalid email or password' });
    }
    
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
        return res.status(401).json({ message: 'Invalid email or password' });
    }
    const payload = { id: user._id, email: user.email ,name: user.name, role: user.role};
    const token = jwt.sign(payload, process.env.JWT_SECRET as string, { expiresIn: '12h' });    
    res.status(200).json({ 
        message: 'Login successful', 
        user: { id: user._id, email: user.email, name: user.name, role: user.role },
        token
    });
});

export const myProfile = TryCatch(async (req: AuthenticatedUser, res) => {
    const user = req.user;
    if (!user) {
        return res.status(404).json({ message: 'Authenticated user not found' });
    }

    res.status(200).json({
        user: {
            id: user._id,
            email: user.email,
            name: user.name,
            role: user.role,
            playlists: user.playlists,
        },
    });
});

