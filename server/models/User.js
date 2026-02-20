import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, 'Name is required'],
            trim: true,
        },
        email: {
            type: String,
            required: [true, 'Email is required'],
            unique: true,
            lowercase: true,
            trim: true,
            match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email'],
        },
        password: {
            type: String,
            required: [true, 'Password is required'],
            minlength: [6, 'Password must be at least 6 characters'],
            select: false, // Don't return password by default
        },
        avatar: {
            type: String,
            default: function () {
                // Generate initials from name
                return this.name
                    .split(' ')
                    .map((n) => n[0])
                    .join('')
                    .toUpperCase()
                    .slice(0, 2);
            },
        },
        checkInStreak: {
            type: Number,
            default: 0,
        },
        lastCheckIn: {
            type: Date,
        },
        dailyFocusGoal: {
            type: Number,
            default: 180, // 3 hours in minutes
        },
        tribes: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Tribe',
            },
        ],
        isAdmin: {
            type: Boolean,
            default: false,
        },
    },
    {
        timestamps: true,
    }
);

// Hash password before saving
// Hash password before saving
userSchema.pre('save', async function () {
    // Only hash if password is modified
    if (!this.isModified('password')) {
        return;
    }

    try {
        const salt = await bcrypt.genSalt(10);
        this.password = await bcrypt.hash(this.password, salt);
    } catch (error) {
        throw new Error(error);
    }
});

// Method to compare password
userSchema.methods.comparePassword = async function (candidatePassword) {
    try {
        return await bcrypt.compare(candidatePassword, this.password);
    } catch (error) {
        throw new Error('Password comparison failed');
    }
};

// Update avatar when name changes - Commented out for debugging
// userSchema.pre('save', function (next) {
//     if (this.isModified('name') && !this.isModified('avatar')) {
//         this.avatar = this.name
//             .split(' ')
//             .map((n) => n[0])
//             .join('')
//             .toUpperCase()
//             .slice(0, 2);
//     }
//     next();
// });

const User = mongoose.model('User', userSchema);

export default User;
