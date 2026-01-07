const express = require('express');
const router = express.Router();
const { createReview, getReviewsForProfessional, checkReviewStatus, getAllReviews, deleteReview } = require('../controllers/reviewController');

router.post('/', createReview);
router.get('/', getAllReviews); // Admin: Get all reviews
router.get('/professional/:professionalId', getReviewsForProfessional);
router.get('/order/:orderId', checkReviewStatus);
router.delete('/:id', deleteReview); // Admin: Delete a review

module.exports = router;
