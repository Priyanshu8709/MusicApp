import mongoose,{Document, Schema} from 'mongoose';

export interface IUser extends Document {
    email: string;
    password: string;
    name: string;
    role: 'user' | 'admin';
    playlists: String[];
    bio: string;
    location: string;
    username: string;
    recentlyPlayed: String[];
    savedAlbums: String[];
    dateJoined: Date;
    continuedListening: String[];
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
    playlists: {
        type: [String],
        default: []
    },
    bio:{
        type:String,
        required:false,
        trim:true,
    },
    location:{
        type:String,
        required:false,
        trim:true,
    },
    username:{
        type:String,
        unique:true,
        required:false,
        trim:true,
    },   
    recentlyPlayed: {
        type: [String],
        default: []
    },
    savedAlbums: {
        type: [String],
        default: []
    },
    dateJoined: {
        type: Date,
        default: Date.now
    },
    continuedListening: {
        type: [String],
        default: []
    },
},
{ timestamps: true });   
const User = mongoose.model<IUser>('User', UserSchema);
export default User;