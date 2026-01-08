
const mongoose = require('mongoose');

const orderSchema = mongoose.Schema(
    {
        customer: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            ref: 'User'
        },
        professional: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        serviceName: { type: String, required: true },
        description: { type: String, required: true },
        status: {
            type: String,
            enum: ['Pending', 'Accepted', 'PaymentPending', 'Completed', 'Cancelled'],
            default: 'Pending'
        },
        price: { type: Number },
        scheduledDate: { type: Date },
    },
    { timestamps: true }
);

module.exports = mongoose.model('Order', orderSchema);
