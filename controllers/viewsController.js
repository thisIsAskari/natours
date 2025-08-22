const Tour = require('../models/tourModel');
const catchAsync = require('../utils/catchAsync');

exports.getOverview = catchAsync(async (req, res) => {
  // 1 Get tours data from collection
  // 2 Build template
  // 3 Render that tenplate using tour data from 1
  const tours = await Tour.find();
  // 4 Render that template
  res.status(200).render('overview', {
    title: 'This is a overview page',
    tours,
  });
});

exports.getTour = catchAsync(async (req, res, next) => {
  // 1 Get the data for the requested tour (including reviews and guides)
  const tour = await Tour.findOne({ slug: req.params.slug }).populate({
    path: 'reviews',
    fields: 'review rating user', // required fields from reviews
  });
  res.status(200).render('tour', {
    title: `${tour.name} Tour`,
    tour,
  });
});

exports.getLoginForm = (req, res) => {
  res.status(200).render('login', {
    title: 'Log into your account',
  });
};
