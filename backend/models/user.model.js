import mongoose from 'mongoose';
import { genSalt, hash } from 'bcryptjs';

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Name is required'],
        trim: true,
    },
    email: {
        type: String,
        required: [true, 'Email is required'],
        trim: true,
        unique: true,
    },
    password: {
        // Optional: Google-authenticated users have no local password.
        type: String,
        minlength: [6, 'Password must be atleast 6 characters long'],
    },
    googleId: {
        type: String,
    },
    image: {
        type: String,
        default: '',
    },
    recentDocs: [
        {
            document: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Document',
            },
            accessed: {
                type: Date,
                default: Date.now,
            },
        },
    ],
    resetPasswordToken: { type: String },
    resetPasswordExpires: { type: Date },
});

userSchema.pre('save', async function (next) {
    if (this.isModified('password')) {
        const salt = await genSalt(10);
        this.password = await hash(this.password, salt);
    }
    next();
});

const User = mongoose.model('User', userSchema);
export default User;
