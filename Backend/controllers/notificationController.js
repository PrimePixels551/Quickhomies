const Notification = require('../models/Notification');

// Get all notifications for a user
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

// Get unread notification count for a user (for badge display)
const getUnreadCount = async (req, res) => {
    try {
        const { userId } = req.query;
        if (!userId) return res.status(400).json({ message: 'User ID required' });

        const count = await Notification.countDocuments({ recipient: userId, read: false });
        res.json({ count });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Create a new notification (for admin use or system triggers)
const createNotification = async (req, res) => {
    try {
        const { recipient, title, message, type, relatedId } = req.body;

        if (!recipient || !title || !message) {
            return res.status(400).json({ message: 'Recipient, title, and message are required' });
        }

        const notification = await Notification.create({
            recipient,
            title,
            message,
            type: type || 'system',
            relatedId
        });

        res.status(201).json(notification);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Mark a single notification as read
const markRead = async (req, res) => {
    try {
        const { id } = req.params;
        await Notification.findByIdAndUpdate(id, { read: true });
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Mark all notifications as read for a user
const markAllRead = async (req, res) => {
    try {
        const { userId } = req.body;
        await Notification.updateMany({ recipient: userId, read: false }, { read: true });
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Delete a notification
const deleteNotification = async (req, res) => {
    try {
        const { id } = req.params;
        const notification = await Notification.findByIdAndDelete(id);
        if (!notification) {
            return res.status(404).json({ message: 'Notification not found' });
        }
        res.json({ success: true, message: 'Notification deleted' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Delete all notifications for a user
const deleteAllNotifications = async (req, res) => {
    try {
        const { userId } = req.body;
        if (!userId) return res.status(400).json({ message: 'User ID required' });

        await Notification.deleteMany({ recipient: userId });
        res.json({ success: true, message: 'All notifications deleted' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    getNotifications,
    getUnreadCount,
    createNotification,
    markRead,
    markAllRead,
    deleteNotification,
    deleteAllNotifications
};

