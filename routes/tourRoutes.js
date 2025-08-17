const express = require('express');
const router = express.Router();
const authController = require('./../controllers/authController');
const tourController = require('./../controllers/tourController');
const reviewRouter = require('./reviewRoutes');

// router.param('id', tourController.checkIdMiddleware);

router
  .route('/top-5-cheap')
  .get(tourController.aliasTopToursMiddleware, tourController.getAllTours);

router.route('/tour-stats').get(tourController.getTourStats);
router
  .route('/monthly-plan/:year')
  .get(
    authController.protect,
    authController.restrictTo('admin', 'lead-guide', 'guide'),
    tourController.getMonthlyPlan,
  );

router
  .route('/tours-within/:distance/center/:latlng/unit/:unit')
  .get(tourController.getToursWithin);

router
  .route('/')
  .get(tourController.getAllTours)
  .post(
    authController.protect,
    authController.restrictTo('admin', 'lead-guide'),
    tourController.createTour,
  );

router
  .route('/:id')
  .get(tourController.getTour)
  .patch(
    authController.protect,
    authController.restrictTo('admin', 'lead-guide'),
    tourController.updateTour,
  )
  .delete(
    authController.protect,
    authController.restrictTo('admin', 'lead-guide'),
    tourController.deleteTour,
  );

// POST /tour/234fswd/reviews
// GET /tour/234fswd/reviews
// GET /tour/234fswd/reviews/9874fad
// router
//   .route('/:tourId/reviews')
//   .post(
//     authController.protect,
//     authController.restrictTo('user'),
//     reviewController.createReview,
//   );

// when user goes to /api/v1/tours/:tourId/reviews
// the tour router pass this request to reviewRouter
// similar work as we done in app.js to pass request to the coresponding router accordingly
// but here is the issue the reviewRouter can't access the tourId
// so we need to merge params to the reviewRouter, to get access to the tourId
router.use('/:tourId/reviews', reviewRouter);

module.exports = router;
