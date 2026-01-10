
const User = require('../models/User');

const getProfessionals = async (req, res) => {
    try {
        const professionals = await User.find({ role: 'professional', verificationStatus: 'verified' }).select('-password');
        res.json(professionals);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const getAllProfessionals = async (req, res) => {
    try {
        const professionals = await User.find({ role: 'professional' }).select('-password');
        res.json(professionals);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const getProfessionalsByCategory = async (req, res) => {
    try {
        const { category } = req.params;
        const professionals = await User.find({ role: 'professional', serviceCategory: category, verificationStatus: 'verified', isAvailable: true }).select('-password');
        res.json(professionals);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

const getUsers = async (req, res) => {
    try {
        const users = await User.find({ role: 'user' }).select('-password');
        res.json(users);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const updateUserStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { verificationStatus } = req.body;
        const user = await User.findByIdAndUpdate(id, { verificationStatus }, { new: true });
        res.json(user);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const toggleAvailability = async (req, res) => {
    try {
        const { id } = req.params;

        // First find the user to get current availability
        const user = await User.findById(id);

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Use findByIdAndUpdate to avoid triggering pre-save hook
        const updatedUser = await User.findByIdAndUpdate(
            id,
            { isAvailable: !user.isAvailable },
            { new: true }
        ).select('-password');

        res.json({
            _id: updatedUser._id,
            name: updatedUser.name,
            email: updatedUser.email,
            role: updatedUser.role,
            isAvailable: updatedUser.isAvailable,
        });
    } catch (error) {
        console.error('Toggle Availability Error:', error);
        res.status(500).json({ message: error.message });
    }
};
const updateProfile = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, phone, address, email } = req.body;

        const user = await User.findById(id);

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Use findByIdAndUpdate to avoid triggering pre-save hook
        const updatedUser = await User.findByIdAndUpdate(
            id,
            {
                name: name || user.name,
                phone: phone !== undefined ? phone : user.phone,
                address: address !== undefined ? address : user.address,
                email: email || user.email,
            },
            { new: true }
        ).select('-password');

        res.json(updatedUser);
    } catch (error) {
        console.error('Update Profile Error:', error);
        res.status(500).json({ message: error.message });
    }
};

const getUser = async (req, res) => {
    try {
        const { id } = req.params;
        const user = await User.findById(id).select('-password');
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.json(user);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const deleteUser = async (req, res) => {
    try {
        const { id } = req.params;
        const user = await User.findByIdAndDelete(id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.json({ message: 'User deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Admin: Update any user fields
const adminUpdateUser = async (req, res) => {
    try {
        const { id } = req.params;
        const updates = req.body;

        // Remove fields that shouldn't be updated
        delete updates.password;
        delete updates._id;

        const user = await User.findByIdAndUpdate(id, updates, { new: true }).select('-password');
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.json(user);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Upgrade customer to professional/partner
const upgradeToPartner = async (req, res) => {
    try {
        const { id } = req.params;
        const { serviceCategory, isAvailable, idProof } = req.body;

        if (!serviceCategory) {
            return res.status(400).json({ message: 'Service category is required' });
        }

        const user = await User.findById(id);

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        if (user.role === 'professional') {
            return res.status(400).json({ message: 'User is already a partner' });
        }

        const updateData = {
            role: 'professional',
            serviceCategory,
            isAvailable: isAvailable || false,
            verificationStatus: 'pending'
        };

        // Add idProof if provided
        if (idProof) {
            updateData.idProof = idProof;
        }

        const updatedUser = await User.findByIdAndUpdate(
            id,
            updateData,
            { new: true }
        ).select('-password');

        res.json(updatedUser);
    } catch (error) {
        console.error('Upgrade to Partner Error:', error);
        res.status(500).json({ message: error.message });
    }
};

module.exports = { getProfessionals, getAllProfessionals, getProfessionalsByCategory, getUsers, updateUserStatus, toggleAvailability, updateProfile, getUser, deleteUser, adminUpdateUser, upgradeToPartner };
