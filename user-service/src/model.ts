import mongoose,{Document, Schema} from 'mongoose';

export interface IUser extends Document {
    email: string;
    password: string;
    name: string;
    role: 'user' | 'admin';
    playlists: String[];
}
const UserSchema: Schema<IUser> = new Schema({
    email: { 
        type: String,
        required: true, 
        unique: true 
    },
    password: { 
        type: String, 
        required: true 
    },
    name: { 
        type: String, 
        required: true 
    },
    role: { 
        type: String, 
        enum: ['user', 'admin'], 
        default: 'user' 
    },
    playlists: [{ 
        type: String, 
        required: true
    }],
},
{ timestamps: true });   
const User = mongoose.model<IUser>('User', UserSchema);
export default User;