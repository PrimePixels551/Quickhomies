const mongoose = require('mongoose');

const serviceSchema = mongoose.Schema(
    {
        name: { type: String, required: true },
        icon: { type: String, required: true },
        minPrice: { type: Number, default: 0 },
        maxPrice: { type: Number, default: 0 },
    },
    { timestamps: true }
);

module.exports = mongoose.model('Service', serviceSchema);
