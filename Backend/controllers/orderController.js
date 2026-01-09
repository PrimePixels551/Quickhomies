
const Order = require('../models/Order');

const Notification = require('../models/Notification');

// Create new order
const createOrder = async (req, res) => {
    const { customer, professional, serviceName, description, price } = req.body;

    if (!customer || !serviceName || !description) {
        return res.status(400).json({ message: 'Missing order details' });
    }

    try {
        const order = await Order.create({
            customer,
            professional, // Optional at start if open to all
            serviceName,
            description,
            price,
            status: 'Pending',
        });

        // Notify Professional if assigned
        if (professional) {
            await Notification.create({
                recipient: professional,
                title: 'New Service Request',
                message: `You have received a new request for ${serviceName}`,
                type: 'order',
                relatedId: order._id
            });
        }

        res.status(201).json(order);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Get orders by user (customer or professional)
const getOrders = async (req, res) => {
    const { userId, role } = req.query; // pass userId and role in query params for simplicity

    try {
        let orders;
        if (role === 'professional') {
            // Find orders where this pro is assigned OR orders are pending and match their category (advanced logic pending)
            // For now, simple: linked to pro
            orders = await Order.find({ professional: userId }).populate('customer', 'name phone address email');
        } else {
            orders = await Order.find({ customer: userId }).populate('professional', 'name phone rating');
        }
        res.json(orders);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

const updateOrderStatus = async (req, res) => {
    const { id } = req.params;
    const { status, price } = req.body;

    try {
        const order = await Order.findById(id);
        if (order) {
            const oldStatus = order.status;
            order.status = status || order.status;
            if (price !== undefined) {
                order.price = price;
            }
            const updatedOrder = await order.save();

            // Notify Customer on status change
            if (status && status !== oldStatus && order.customer) {
                await Notification.create({
                    recipient: order.customer,
                    title: 'Order Status Updated',
                    message: `Your order for ${order.serviceName} is now ${status}`,
                    type: 'order',
                    relatedId: order._id
                });
            }

            res.json(updatedOrder);
        } else {
            res.status(404).json({ message: 'Order not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

const getAllOrders = async (req, res) => {
    try {
        const orders = await Order.find({})
            .populate('customer', 'name phone')
            .populate('professional', 'name phone');
        res.json(orders);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

const deleteOrder = async (req, res) => {
    try {
        const { id } = req.params;
        const order = await Order.findByIdAndDelete(id);
        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }
        res.json({ message: 'Order deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = { createOrder, getOrders, updateOrderStatus, getAllOrders, deleteOrder };
