const express = require('express');
const router = express.Router();
const { getServices, createService, deleteService, updateService } = require('../controllers/serviceController');

router.route('/').get(getServices).post(createService);
router.route('/:id').delete(deleteService).put(updateService);

module.exports = router;
