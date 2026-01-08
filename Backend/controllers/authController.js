
const User = require('../models/User');
const generateToken = require('../utils/generateToken');

// @desc    Auth user & get token
// @route   POST /api/auth/login
// @access  Public
// @desc    Auth user & get token
// @route   POST /api/auth/login
// @access  Public
const loginUser = async (req, res) => {
    const { phone, password } = req.body;
    console.log('Login attempt:', { phone, password });

    const user = await User.findOne({ phone });
    console.log('User found:', user ? 'Yes' : 'No');

    if (user && (await user.matchPassword(password))) {
        res.json({
            _id: user._id,
            name: user.name,
            email: user.email,
            phone: user.phone,
            address: user.address,
            role: user.role,
            token: generateToken(user._id),
            profileImage: user.profileImage,
            experience: user.experience,
        });
    } else {
        console.log('Login failed: Invalid credentials');
        res.status(401).json({ message: 'Invalid phone or password' });
    }
};

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
const registerUser = async (req, res) => {
    const { name, email, password, phone, role, serviceCategory, address, isAvailable, idProof, experience, profileImage } = req.body;

    // Check if user exists by phone (primary identifier)
    const userExists = await User.findOne({ phone });

    if (userExists) {
        res.status(400).json({ message: 'User already exists with this phone number' });
        return;
    }

    // Only check email if it was provided
    if (email) {
        const emailExists = await User.findOne({ email });
        if (emailExists) {
            res.status(400).json({ message: 'User already exists with this email' });
            return;
        }
    }

    const user = await User.create({
        name,
        email: email || undefined, // Store undefined if empty string or null
        password,
        phone,
        address,
        role: role || 'user',
        verificationStatus: role === 'professional' ? 'pending' : 'verified',
        serviceCategory, // optional, for professionals
        idProof, // optional, for professionals
        experience, // optional, for professionals
        profileImage, // optional, for professionals
        isAvailable, // optional
    });

    if (user) {
        res.status(201).json({
            _id: user._id,
            name: user.name,
            email: user.email,
            phone: user.phone,
            address: user.address,
            role: user.role,
            token: generateToken(user._id),
            profileImage: user.profileImage,
            experience: user.experience,
        });
    } else {
        res.status(400).json({ message: 'Invalid user data' });
    }
};

module.exports = { loginUser, registerUser };
