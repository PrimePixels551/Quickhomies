const Notification = require('../models/Notification');

const getNotifications = async (req, res) => {
    try {
        const { userId } = req.query;
        if (!userId) return res.status(400).json({ message: 'User ID required' });

        const notifications = await Notification.find({ recipient: userId })
            .sort({ createdAt: -1 })
            .limit(50);
        res.json(notifications);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const markRead = async (req, res) => {
    try {
        const { id } = req.params;
        await Notification.findByIdAndUpdate(id, { read: true });
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const markAllRead = async (req, res) => {
    try {
        const { userId } = req.body;
        await Notification.updateMany({ recipient: userId, read: false }, { read: true });
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = { getNotifications, markRead, markAllRead };
