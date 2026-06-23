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
    const payload = { id: newUser._id.toString(), email: newUser.email, name: newUser.name, role: newUser.role };
    const token = jwt.sign(payload, process.env.JWT_SECRET as string, { expiresIn: '12h' });
    res.status(201).json({ message: 'User created successfully', user: { id: newUser._id, email: newUser.email, name: newUser.name, role: newUser.role }, token });
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
    const payload = { id: user._id.toString(), email: user.email, name: user.name, role: user.role };
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
            bio: user.bio,
            location: user.location,
            username: user.username,
            savedAlbums: user.savedAlbums,
            recentlyPlayed: user.recentlyPlayed,
            continuedListening: user.continuedListening,
            dateJoined: user.dateJoined,
        },
    });
});

export const updateProfile = TryCatch(async (req: AuthenticatedUser, res) => {
    const user = req.user;
    if (!user) {
        return res.status(404).json({ message: 'Authenticated user not found' });
    }
    const { name, bio, location, username } = req.body;
    // Allow partial updates
    const update: any = {};
    if (name) update.name = name;
    if (bio) update.bio = bio;
    if (location) update.location = location;
    if (username) update.username = username;
    if (Object.keys(update).length === 0) return res.status(400).json({ message: 'No fields provided for update' });
    const newUser = await User.findByIdAndUpdate(user._id, update, { new: true });
    if (!newUser) {
        return res.status(404).json({ message: 'User not found' });
    }
    res.status(200).json({ message: 'Profile updated successfully', user: newUser });
});

export const deleteUser = TryCatch(async (req: AuthenticatedUser, res) => {
    const user = req.user;
    if (!user) {
        return res.status(404).json({ message: 'Authenticated user not found' });
    }
    await User.findByIdAndDelete(user._id);
    res.status(200).json({ message: 'User deleted successfully' });
});

export const updatePassword = TryCatch(async (req: AuthenticatedUser, res) => {
    const user = req.user;
    if (!user) {
        return res.status(404).json({ message: 'Authenticated user not found' });
    }
    const { oldPassword, newPassword } = req.body;
    if (!oldPassword || !newPassword) {
        return res.status(400).json({ message: 'Old password and new password are required' });
    }
    // Fetch full user record (including hashed password) from DB
    const dbUser = await User.findById(user._id);
    if (!dbUser) return res.status(404).json({ message: 'User not found' });
    const isPasswordValid = await bcrypt.compare(oldPassword, dbUser.password);
    if (!isPasswordValid) {
        return res.status(401).json({ message: 'Old password is incorrect' });
    }
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await User.findByIdAndUpdate(user._id, { password: hashedPassword });
    res.status(200).json({ message: 'Password updated successfully' });
});
