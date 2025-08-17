const mongoose = require('mongoose');
const slugify = require('slugify');
const validator = require('validator');
// const User = require('./userModel');

const tourSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'A tour must have a name'],
      unique: true,
      trim: true,
      maxlength: [40, 'A tour name must have less or equal then 40 characters'],
      minlenght: [10, 'A tour name must have more or equal then 10 characters'],
      // validator: [
      //   validator.isAlpha,
      //   'A tour name must be conatin only characters',
      // ],
    },
    slug: { type: String },
    duration: {
      type: Number,
      required: [true, 'A tour must have a duration'],
    },
    maxGroupSize: {
      type: Number,
      required: [true, 'A tour must have a group size'],
    },
    difficulty: {
      type: String,
      required: [true, 'A tour must have a difficulty'],
      enum: ['easy', 'medium', 'difficult'],
      message: 'Difficulty is either: easy, medium, difficult',
    },
    ratingsAverage: {
      type: Number,
      default: 4.5,
      min: [1.0, 'Rating must be above 1.0'],
      max: [5.0, 'Rating must be below 5.0'],
      set: (val) => Math.round(val * 10) / 10, // 4.666666, 46.6666, 47, 4.7
    },
    ratingsQuantity: {
      type: Number,
      default: 0,
    },
    price: {
      type: Number,
      required: [true, 'A tour must have a price'],
    },
    priceDiscount: {
      type: Number,
      validate: {
        validator: function (val) {
          // this only point to current doc on NEW document creation
          return val < this.price;
        },
        message: 'Discount price ({VALUE}) should be below regular price',
      },
    },
    summary: {
      type: String,
      trim: true,
      required: [true, 'A tour must have a summary'],
    },
    description: {
      type: String,
      trim: true,
    },
    imageCover: {
      type: String,
      required: [true, 'A tour must have a cover image'],
    },
    images: [String],
    createdAt: {
      type: Date,
      default: Date.now(),
    },
    startDate: [Date],
    secretTour: {
      type: Boolean,
    },
    startLocation: {
      // GeoJSON
      type: {
        type: String,
        default: 'Point',
        enum: ['Point'],
      },
      coordinates: [Number],
      address: String,
      description: String,
    },
    locations: [
      {
        type: {
          type: String,
          default: 'Point',
          enum: ['Point'],
        },
        coordinates: [Number],
        address: String,
        description: String,
        day: Number,
      },
    ],
    guides: [
      {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
      },
    ],
  },
  {
    // all these virtuals properties does is make sure that when we have virtual property
    // so basically a field that not stored in the database but we calculated with some other value
    // so want this is to also show up when ever there was an output
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

// 1 for ASC Order and -1 for DESC order
// tourSchema.index({price: 1});
tourSchema.index({ price: 1, ratingsAverage: -1 }); // compound index
tourSchema.index({ slug: 1 }); // single field index
// tourSchema.index({ startLocation: '2dsphere' });

//this virtual property is not able to be a part or query because it is not exist in DB
tourSchema.virtual('durationWeeks').get(function () {
  return this.duration / 7;
});

// this virtual property is not able to be a part or query because it is not exist in DB
// but we can use it to populate the data from other collection
// this is a one to many relationship
// one tour can have many reviews
// controller function used this virtual property to populate the data from other collection
// you can check this on getTour() function in tourController.js
tourSchema.virtual('reviews', {
  ref: 'Review',
  foreignField: 'tour',
  localField: '_id',
});

// DOCUMENT MIDDLEWARE: runs before .save() and .create() not for update
tourSchema.pre('save', function (next) {
  this.slug = slugify(this.name, { lower: true });
  next();
});

// approch with embedding user "guide" data into tour document
// tourSchema.pre('save', async function (next) {
//   const guidesPromise = this.guides.map(async (id) => await User.findById(id));
//   this.guides = await Promise.all(guidesPromise);
//   next();
// });

// tourSchema.post('save', function (doc, next) {
//   console.log('Will save document...');
//   next();
// });

// tourSchema.post('save', function (doc, next) {
//   console.log(doc);
//   next();
// });

// QUERY MIDDLEWARE
// regular expression for all functions which start from find
// tourSchema.pre('find', function(){
tourSchema.pre(/^find/, function (next) {
  this.find({ secretTour: { $ne: true } });

  this.start = Date.now();
  next();
});

tourSchema.post(/^find/, function (doc, next) {
  console.log(`This query took ${Date.now() - this.start} milliseconds`);
  next();
});

tourSchema.pre(/^find/, function (next) {
  // this.populate is actually getting the the reference data from other/connected collection
  // Eg: here we are getting the user data from user collection using guides id when we are querying the tour collection
  this.populate({
    path: 'guides',
    select: '-__v -passwordChangedAt',
  });
  next();
});

// AGGREGATION MIDDLEWARE
//aggregation middleware is used to mainuplate data according to requirement pre or post aggregation pipeline works
//This line sets up a pre-middleware hook for the aggregate operation on the tourSchema.
// Pre-middleware hooks are functions that are executed before a certain operation (in this case, aggregate) is performed on the schema.
// Aggregation Pipeline: MongoDB's aggregation framework allows you to process data records and return computed results.
// The pipeline consists of stages, each performing a specific operation on the input documents.
tourSchema.pre('aggregate', function (next) {
  //this.pipeline() is a method that returns the aggregation pipeline for the current aggregate operation.
  //unshift is standered JS function used to add something at the start of array
  // The .unshift() method is used to add a new stage to the beginning of the pipeline array, ensuring that the $match stage is the first operation performed during aggregation.
  // The element being added is a MongoDB aggregation stage: { $match: { secretTour: { $ne: true } } }.
  // This stage filters out documents where the secretTour field is not equal to true.
  this.pipeline().unshift({ $match: { secretTour: { $ne: true } } });

  next();
});

const Tour = mongoose.model('Tour', tourSchema);

module.exports = Tour;
