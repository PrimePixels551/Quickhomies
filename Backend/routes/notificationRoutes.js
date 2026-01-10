const express = require('express');
const router = express.Router();
const {
    getNotifications,
    getUnreadCount,
    createNotification,
    markRead,
    markAllRead,
    deleteNotification,
    deleteAllNotifications
} = require('../controllers/notificationController');

// GET endpoints
router.get('/', getNotifications);
router.get('/unread-count', getUnreadCount);

// POST endpoints
router.post('/', createNotification);

// PUT endpoints
router.put('/:id/read', markRead);
router.put('/read-all', markAllRead);

// DELETE endpoints
router.delete('/:id', deleteNotification);
router.delete('/delete-all', deleteAllNotifications);

module.exports = router;

