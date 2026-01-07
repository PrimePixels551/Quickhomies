const Review = require('../models/Review');
const User = require('../models/User');
const Order = require('../models/Order');

// Create a new review
const createReview = async (req, res) => {
    try {
        const { orderId, rating, comment } = req.body;
        const customerId = req.body.customerId;

        // Check if order exists
        const order = await Order.findById(orderId);
        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }

        // Check if order is completed
        if (order.status !== 'Completed') {
            return res.status(400).json({ message: 'Can only review completed orders' });
        }

        // Check if already reviewed
        const existingReview = await Review.findOne({ order: orderId });
        if (existingReview) {
            return res.status(400).json({ message: 'Order already reviewed' });
        }

        // Create review
        const review = await Review.create({
            order: orderId,
            customer: customerId,
            professional: order.professional,
            rating,
            comment: comment || '',
        });

        // Update professional's average rating
        const allReviews = await Review.find({ professional: order.professional });
        const avgRating = allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length;

        await User.findByIdAndUpdate(order.professional, {
            rating: Math.round(avgRating * 10) / 10, // Round to 1 decimal
            reviewCount: allReviews.length,
        });

        res.status(201).json(review);
    } catch (error) {
        console.error('Create Review Error:', error);
        res.status(500).json({ message: error.message });
    }
};

// Get reviews for a professional
const getReviewsForProfessional = async (req, res) => {
    try {
        const { professionalId } = req.params;
        const reviews = await Review.find({ professional: professionalId })
            .populate('customer', 'name')
            .sort({ createdAt: -1 });
        res.json(reviews);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Check if order has been reviewed
const checkReviewStatus = async (req, res) => {
    try {
        const { orderId } = req.params;
        const review = await Review.findOne({ order: orderId });
        res.json({ reviewed: !!review, review });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Admin: Get all reviews
const getAllReviews = async (req, res) => {
    try {
        const reviews = await Review.find()
            .populate('customer', 'name email')
            .populate('professional', 'name email serviceCategory')
            .populate('order', 'serviceName')
            .sort({ createdAt: -1 });
        res.json(reviews);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Admin: Delete a review
const deleteReview = async (req, res) => {
    try {
        const { id } = req.params;
        const review = await Review.findById(id);

        if (!review) {
            return res.status(404).json({ message: 'Review not found' });
        }

        const professionalId = review.professional;

        await Review.findByIdAndDelete(id);

        // Recalculate professional's average rating
        const remainingReviews = await Review.find({ professional: professionalId });
        if (remainingReviews.length > 0) {
            const avgRating = remainingReviews.reduce((sum, r) => sum + r.rating, 0) / remainingReviews.length;
            await User.findByIdAndUpdate(professionalId, {
                rating: Math.round(avgRating * 10) / 10,
                reviewCount: remainingReviews.length,
            });
        } else {
            await User.findByIdAndUpdate(professionalId, {
                rating: 0,
                reviewCount: 0,
            });
        }

        res.json({ message: 'Review deleted successfully' });
    } catch (error) {
        console.error('Delete Review Error:', error);
        res.status(500).json({ message: error.message });
    }
};

module.exports = { createReview, getReviewsForProfessional, checkReviewStatus, getAllReviews, deleteReview };
