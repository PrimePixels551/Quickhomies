
const express = require('express');
const router = express.Router();
const { createOrder, getOrders, updateOrderStatus, getAllOrders, deleteOrder } = require('../controllers/orderController');

router.post('/', createOrder);
router.get('/', getOrders);
router.get('/all', getAllOrders);
router.put('/:id/status', updateOrderStatus);
router.delete('/:id', deleteOrder);

module.exports = router;
