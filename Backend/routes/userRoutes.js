const express = require('express');
const router = express.Router();
const { getProfessionals, getAllProfessionals, getProfessionalsByCategory, getUsers, updateUserStatus, toggleAvailability, updateProfile, getUser, deleteUser, adminUpdateUser, upgradeToPartner } = require('../controllers/userController');

router.get('/', getUsers);
router.get('/professionals', getProfessionals);
router.get('/admin/professionals', getAllProfessionals);
router.get('/professionals/:category', getProfessionalsByCategory);
router.get('/:id', getUser);
router.put('/:id/status', updateUserStatus);
router.put('/:id/availability', toggleAvailability);
router.put('/:id/profile', updateProfile);
router.put('/:id/admin', adminUpdateUser);
router.put('/:id/upgrade-to-partner', upgradeToPartner);
router.delete('/:id', deleteUser);

module.exports = router;

