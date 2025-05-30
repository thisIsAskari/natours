const mongoose = require('mongoose');

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

const Review = mongoose.model('Review', reviewSchema);
module.exports = Review;
