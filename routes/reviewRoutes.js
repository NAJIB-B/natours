const express = require('express');

const {
  getAllReviews,
  createReview,
  getReview,
  deleteReview,
  updateReview,
  setTourUserIds
} = require('../controllers/reviewController');
const { protect, restrictTo } = require('../controllers/authController');

const router = express.Router({mergeParams: true});

router.use(protect)

router
  .route('/')
  .get(getAllReviews)
  .post( restrictTo('user'), setTourUserIds, createReview);

router.route('/:id').get(getReview).delete(restrictTo('user', 'admin'), deleteReview).patch(restrictTo('user', 'admin'), updateReview)


module.exports = router;
