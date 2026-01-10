const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = mongoose.Schema(
    {
        name: { type: String, required: true },
        email: { type: String, required: false },
        // Password is optional for regular users (customers), required for professionals
        password: { type: String, required: false },
        phone: { type: String, required: true, unique: true },
        address: { type: String, required: true, },
        role: {
            type: String,
            enum: ['user', 'professional', 'admin'],
            default: 'user'
        },
        verificationStatus: {
            type: String,
            enum: ['pending', 'verified', 'rejected'],
            default: 'pending'
        },
        // Only for professionals
        idProof: { type: String },
        profileImage: { type: String },
        serviceCategory: { type: String },
        experience: { type: Number },
        isAvailable: { type: Boolean, default: true },
        rating: { type: Number, default: 0 },
        jobsCompleted: { type: Number, default: 0 },
        reviewCount: { type: Number, default: 0 },
    },
    { timestamps: true }
);

userSchema.methods.matchPassword = async function (enteredPassword) {
    // If no password set, return false
    if (!this.password) {
        return false;
    }
    return await bcrypt.compare(enteredPassword, this.password);
};

userSchema.pre('save', async function (next) {
    // Skip hashing if password isn't set or hasn't been modified
    if (!this.password || !this.isModified('password')) {
        return next();
    }
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
});

module.exports = mongoose.model('User', userSchema);
