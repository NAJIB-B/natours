const express = require('express');

const {
  getTour,
  getAllTours,
  createTour,
  updateTour,
  deleteTour,
  aliasTopTours,
  getTourStats,
  getMonthlyPlan,
  getToursWithin,
  getDistances
} = require('../controllers/tourController');

const {protect, restrictTo} = require('../controllers/authController')
const reviewRouter = require('../routes/reviewRoutes')




const router = express.Router();


router.use('/:tourId/reviews', reviewRouter)

router.route('/tours-within/:distance/center/:latlng/unit/:unit').get(getToursWithin)

router.route('/distances/:latlng/unit/:unit').get(getDistances)

//router.param('id', checkID);

router.route('/top-5-cheap').get(aliasTopTours, getAllTours)

router.route('/tour-stats').get(getTourStats)
router.route('/monthly-plan/:year').get(protect, restrictTo('admin', 'lead-guide', 'guide'), getMonthlyPlan)


router.route('/').get(getAllTours).post(protect, restrictTo('admin', 'lead-guide'), createTour);
router.route('/:id')
  .get(getTour)
  .patch(protect, restrictTo('admin', 'lead-guide'), updateTour)
  .delete(protect, restrictTo('admin', 'lead-guide'), deleteTour);




module.exports = router;
