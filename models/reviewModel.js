const mongoose = require('mongoose');
const Tour = require('./tourModel');

const reviewSchema = new mongoose.Schema(
  {
    review: {
      type: String,
      required: [true, 'Review can not be empty!'],
    },
    rating: {
      type: Number,
      default: 4.5,
      min: [1.0, 'Rating must be above 1.0'],
      max: [5.0, 'Rating must be below 5.0'],
    },
    createdAt: {
      type: Date,
      default: Date.now(),
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
    // all these virtuals properties does is make sure that when we have virtual property
    // so basically a field that not stored in the database but we calculated with some other value
    // so want this is to also show up when ever there was an output
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

// 1 user can give 1 review on each tour
reviewSchema.index({ tour: 1, user: 1 }, { unique: true });

// QUERY MIDDLEWARE
// regular expression for all functions which start from find
reviewSchema.pre(/^find/, function (next) {
  // this.populate is actually getting the the reference data from other/connected collection
  // Eg: here we are getting the tour and user data from tour and user collection using tour and user id when we are querying the review collection
  // the path value is the name of the field in the review collection that is referencing the tour and user collection
  // the select value is the fields that we want to select from the tour and user collection

  // We commented out tour populate because it will creating a chain of populate
  // this.populate({ path: 'tour', select: 'name' }).populate({
  //   path: 'user',
  //   select: 'name photo',
  // });
  this.populate({
    path: 'user',
    select: 'name photo',
  });
  // next() is used to move to the next middleware
  next();
});

// store and update no of ratings and ratings Average when new review is created
// by doing this we do not need to calculate it on showing stats
// so we are update all review related with the tour id
// when review is created, updated or deleted
// we are using static method on our Schema, that's the feature of mongoos
// we used instance method that can be called on documents
// but these can be called on model directly
reviewSchema.statics.calcAverageRatings = async function (tourId) {
  // we are using aggrigation pipline to cauculate statics
  // this keyword points to current model
  // we are using aggregate method on our model
  // aggregate method takes an array of pipline stages
  // each stage is an object

  const stats = await this.aggregate([
    {
      // first stage is to select all review related with the tour id
      $match: { tour: tourId },
    },
    {
      // second stage is to calculate average rating
      // we are using $avg operator to calculate average
      // $avg operator takes a field name as a value
      // in our case we want to calculate average of rating field
      $group: {
        _id: '$tour',
        nRating: { $sum: 1 },
        avgRating: { $avg: '$rating' },
      },
    },
  ]);
  console.log(stats);

  if (stats.length > 0) {
    await Tour.findByIdAndUpdate(tourId, {
      ratingsQuantity: stats[0].nRating,
      ratingsAverage: stats[0].avgRating,
    });
  } else {
    // set as default
    await Tour.findByIdAndUpdate(tourId, {
      ratingsQuantity: 0,
      ratingsAverage: 4.5,
    });
  }
};

reviewSchema.post('save', function () {
  // this points to current document
  // this.constructor points to current model
  // we are using calcAverageRatings method on current model
  // we are passing tour id as a argument
  this.constructor.calcAverageRatings(this.tour);
});

//findByIdAndUpdate
//findByIdAndDelete
// we need to update review ratingsQuantity and ratingsAverage when review is updated or deleted
// we are using pre and post middleware to update review ratingsQuantity and ratingsAverage
// because other then that there is no way to update the ratingsQuantity and ratingsAverage
reviewSchema.pre(/^findOneAnd/, async function (next) {
  // here in this function this keyword points to current query
  // we are using "findOneAnd" keyword for findByIdAndUpdate/findByIdAndDelete method behind the scene on current query
  // findOneAnd method returns a document as a result
  // so we are using this.findOne() to get the document but we do nothing here becuase until this point data is not updated
  // because we are using pre middleware to get the document
  // so we just store the document in this.review(current query variable) to get access in post middleware
  this.re = await this.clone().findOne(); // clone the query before executing
  console.log(this.re);
  next();
});

reviewSchema.post(/^findOneAnd/, async function () {
  // here we know that this.review point to the document that is found by findOneAnd method in pre middleware
  // so now we can update the data and save it
  await this.re.constructor.calcAverageRatings(this.re.tour);
});

const Review = mongoose.model('Review', reviewSchema);
module.exports = Review;
