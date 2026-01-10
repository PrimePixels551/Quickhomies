
const Order = require('../models/Order');

const Notification = require('../models/Notification');

// Helper function to create notification (handles errors gracefully)
const createNotification = async (recipient, title, message, type, relatedId) => {
    try {
        if (!recipient) return;
        await Notification.create({
            recipient,
            title,
            message,
            type: type || 'order',
            relatedId
        });
    } catch (error) {
        console.error('Failed to create notification:', error.message);
    }
};

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

        // Notify Customer - Order Confirmation
        await createNotification(
            customer,
            'Order Placed Successfully! 🎉',
            `Your order for "${serviceName}" has been placed. We'll notify you once a helper accepts your request.`,
            'order',
            order._id
        );

        // Notify Professional if assigned
        if (professional) {
            await createNotification(
                professional,
                'New Service Request! 📋',
                `You have received a new request for "${serviceName}". Check your orders to accept or decline.`,
                'order',
                order._id
            );
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
        const order = await Order.findById(id).populate('professional', 'name').populate('customer', 'name');
        if (order) {
            const oldStatus = order.status;
            order.status = status || order.status;
            if (price !== undefined) {
                order.price = price;
            }
            const updatedOrder = await order.save();

            // Send appropriate notifications based on status change
            if (status && status !== oldStatus) {
                const serviceName = order.serviceName;
                const professionalName = order.professional?.name || 'Helper';
                const customerName = order.customer?.name || 'Customer';

                switch (status) {
                    case 'Accepted':
                        // Notify Customer - Order Accepted
                        await createNotification(
                            order.customer._id || order.customer,
                            'Order Accepted! ✅',
                            `Great news! ${professionalName} has accepted your request for "${serviceName}". They will contact you soon.`,
                            'order',
                            order._id
                        );
                        // Notify Professional - Confirmation
                        await createNotification(
                            order.professional._id || order.professional,
                            'Order Accepted Confirmation',
                            `You have accepted the order for "${serviceName}" from ${customerName}. Please contact them to schedule.`,
                            'order',
                            order._id
                        );
                        break;

                    case 'PaymentPending':
                        // Notify Customer - Payment Required
                        await createNotification(
                            order.customer._id || order.customer,
                            'Payment Required 💳',
                            `Your service for "${serviceName}" is complete. Please proceed with payment of ₹${order.price || 0}.`,
                            'order',
                            order._id
                        );
                        // Notify Professional
                        await createNotification(
                            order.professional._id || order.professional,
                            'Awaiting Payment',
                            `The service for "${serviceName}" is marked complete. Waiting for customer payment of ₹${order.price || 0}.`,
                            'order',
                            order._id
                        );
                        break;

                    case 'Completed':
                        // Notify Customer - Order Completed
                        await createNotification(
                            order.customer._id || order.customer,
                            'Order Completed! 🎉',
                            `Your order for "${serviceName}" has been completed successfully. Thank you for using QuickHomies!`,
                            'order',
                            order._id
                        );
                        // Notify Professional - Payment Received
                        await createNotification(
                            order.professional._id || order.professional,
                            'Payment Received! 💰',
                            `Great news! Payment of ₹${order.price || 0} received for "${serviceName}". Order completed successfully.`,
                            'order',
                            order._id
                        );
                        break;

                    case 'Cancelled':
                        // Notify Customer - Order Cancelled
                        await createNotification(
                            order.customer._id || order.customer,
                            'Order Cancelled ❌',
                            `Your order for "${serviceName}" has been cancelled. If you didn't request this, please contact support.`,
                            'order',
                            order._id
                        );
                        // Notify Professional if assigned
                        if (order.professional) {
                            await createNotification(
                                order.professional._id || order.professional,
                                'Order Cancelled',
                                `The order for "${serviceName}" from ${customerName} has been cancelled.`,
                                'order',
                                order._id
                            );
                        }
                        break;

                    default:
                        // Generic status update notification for customer
                        await createNotification(
                            order.customer._id || order.customer,
                            'Order Status Updated',
                            `Your order for "${serviceName}" is now ${status}.`,
                            'order',
                            order._id
                        );
                        break;
                }
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
            .populate('customer', 'name phone address')
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
