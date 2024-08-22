const mongoose = require('mongoose');

const Tour = require('../models/tourModels');

const reviewSchema = new mongoose.Schema(
  {
    review: {
      type: String,
      required: [true, 'A Tour review must have a review'],
    },
    rating: {
      type: Number,
      default: 4,
      min: [1, 'A tour review must be greater than 1.0'],
      max: [5, 'A tour review must be less than 5.0'],
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
    tour: {
      type: mongoose.Schema.ObjectId,
      ref: 'Tour',
      required: [true, 'Review must belong to a tour'],
    },

    user: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      required: [true, 'Review must belong to a user'],
    },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

reviewSchema.index({tour: 1, user: 1}, {unique: true})

reviewSchema.pre(/^find/, function (next) {
  //this.populate({
  //  path: 'tour',
  //  select: 'name'
  //}).populate({ path: 'user', select: 'name photo'});

  this.populate({ path: 'user', select: 'name photo' });

  next();
});

reviewSchema.statics.calcAverageRatings = async function (tourId) {
  const stats = await this.aggregate([
    {
      $match: { tour: tourId },
    },
    {
      $group: {
        _id: '$tour',
        nRating: { $sum: 1 },
        avgRating: { $avg: '$rating' },
      },
    },
  ]);

  if (stats.length > 0) {

    await Tour.findByIdAndUpdate(tourId, {
      ratingsQuantity: stats[0].nRating,
      ratingsAverage: stats[0].avgRating,
    });
  }
};

reviewSchema.post('save', function () {
  // this points to the current review
  this.constructor.calcAverageRatings(this.tour);
});


// The this.findOne trick doesn't work again need to find a new way
//
//reviewSchema.pre(/^findOneAnd/, async function(next) {
//
//  
//  const rr = await this.findOne()
//  console.log(this.rr)
//  next()
//})
//
//reviewSchema.post(/^findOneAnd/, async function() {
//  // this.findOne does not work here cause query has already beign executed
//
//  await this.r.constructor.calcAverageRatings(this.r);
//})

const Review = mongoose.model('Review', reviewSchema);

module.exports = Review;
