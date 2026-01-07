const mongoose = require('mongoose');

const reviewSchema = mongoose.Schema(
    {
        order: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Order',
            required: true,
        },
        customer: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        professional: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        rating: {
            type: Number,
            required: true,
            min: 1,
            max: 5,
        },
        comment: {
            type: String,
            default: '',
        },
    },
    { timestamps: true }
);

// Ensure one review per order
reviewSchema.index({ order: 1 }, { unique: true });

module.exports = mongoose.model('Review', reviewSchema);
