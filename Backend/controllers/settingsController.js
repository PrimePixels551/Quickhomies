const Settings = require('../models/Settings');

// Get a setting by key
exports.getSetting = async (req, res) => {
    try {
        const { key } = req.params;
        const setting = await Settings.findOne({ key });

        if (!setting) {
            return res.status(404).json({ message: 'Setting not found' });
        }

        res.json(setting);
    } catch (error) {
        console.error('Get setting error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Update or create a setting
exports.upsertSetting = async (req, res) => {
    try {
        const { key, value } = req.body;

        if (!key || !value) {
            return res.status(400).json({ message: 'Key and value are required' });
        }

        const setting = await Settings.findOneAndUpdate(
            { key },
            { key, value },
            { new: true, upsert: true }
        );

        res.json(setting);
    } catch (error) {
        console.error('Upsert setting error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Get all settings
exports.getAllSettings = async (req, res) => {
    try {
        const settings = await Settings.find();
        res.json(settings);
    } catch (error) {
        console.error('Get all settings error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};
