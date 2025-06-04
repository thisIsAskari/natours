const express = require('express');
const reviewController = require('../controllers/reviewController');
const authController = require('../controllers/authController');

const router = express.Router({ mergeParams: true });
// mergeParams: true allows us to access params from the parent router
// now we can access tourId from the parent router

// POST /tour/234fswd/reviews
// GET /tour/234fswd/reviews
// POST /reviews
router
  .route('/:tourId/reviews')
  .get(reviewController.getAllReviews)
  .post(
    authController.protect,
    authController.restrictTo('user'),
    reviewController.createReview,
  );
// POST /reviews
// GET /reviews
router
  .route('/')
  .post(
    authController.protect,
    authController.restrictTo('user'),
    reviewController.createReview,
  )
  .get(reviewController.getAllReviews);

router.route('/:id').delete(reviewController.deleteReview);

module.exports = router;
