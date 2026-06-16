const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const UserSchema = new mongoose.Schema({
    // Authentication Fields
    username: {
        type: String,
        unique: true,
        sparse: true,
        trim: true,
        minlength: [3, 'Username must be at least 3 characters.']
    },
    password: {
        type: String
    },
    role: {
        type: String,
        enum: ['user', 'admin'],
        default: 'user'
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    // Test Fields
    name: {
        type: String
    },
    email: {
        type: String,
        required: [true, 'Email address is required.'],
        unique: true,
        trim: true,
        lowercase: true,
        match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, 'Please enter a valid email address.']
    },
    age: {
        type: Number
    }
});

// Pre-save hook to hash password before saving to the database
UserSchema.pre('save', async function(next) {
    if (!this.password || !this.isModified('password')) return next();
    try {
        const salt = await bcrypt.genSalt(10);
        this.password = await bcrypt.hash(this.password, salt);
        next();
    } catch (err) {
        next(err);
    }
});

// Instance method to check password validity
UserSchema.methods.comparePassword = async function(candidatePassword) {
    try {
        if (!this.password) return false;
        return await bcrypt.compare(candidatePassword, this.password);
    } catch (err) {
        return false;
    }
};

module.exports = mongoose.model('User', UserSchema);
