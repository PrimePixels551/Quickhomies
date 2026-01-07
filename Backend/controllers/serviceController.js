const Service = require('../models/Service');

// @desc    Get all services
// @route   GET /api/services
// @access  Public
const getServices = async (req, res) => {
    try {
        const services = await Service.find({});
        res.json(services);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Create a service
// @route   POST /api/services
// @access  Private/Admin
const createService = async (req, res) => {
    try {
        const { name, icon, minPrice, maxPrice } = req.body;

        const serviceExists = await Service.findOne({ name });

        if (serviceExists) {
            return res.status(400).json({ message: 'Service already exists' });
        }

        const service = await Service.create({
            name,
            icon,
            minPrice: minPrice || 0,
            maxPrice: maxPrice || 0,
        });

        if (service) {
            res.status(201).json(service);
        } else {
            res.status(400).json({ message: 'Invalid service data' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Delete a service
// @route   DELETE /api/services/:id
// @access  Private/Admin
const deleteService = async (req, res) => {
    try {
        const service = await Service.findById(req.params.id);

        if (service) {
            await service.deleteOne();
            res.json({ message: 'Service removed' });
        } else {
            res.status(404).json({ message: 'Service not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Update a service
// @route   PUT /api/services/:id
// @access  Private/Admin
const updateService = async (req, res) => {
    try {
        const { name, icon, minPrice, maxPrice } = req.body;
        const service = await Service.findById(req.params.id);

        if (service) {
            service.name = name || service.name;
            service.icon = icon || service.icon;
            service.minPrice = minPrice !== undefined ? minPrice : service.minPrice;
            service.maxPrice = maxPrice !== undefined ? maxPrice : service.maxPrice;

            const updatedService = await service.save();
            res.json(updatedService);
        } else {
            res.status(404).json({ message: 'Service not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    getServices,
    createService,
    deleteService,
    updateService,
};
