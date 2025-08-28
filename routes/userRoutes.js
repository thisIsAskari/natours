const express = require('express');
const multer = require('multer');
const router = express.Router();
const userController = require('../controllers/userController');
const authController = require('../controllers/authController');

// auth
router.post('/signup', authController.signup);
router.post('/login', authController.login);
router.get('/logout', authController.logout);
router.post('/forgotPassword', authController.forgotPassword);
router.patch('/resetPassword/:token', authController.resetPassword);

// Remember that authController.protect is a middleware function
// and middleware works always in sequence
// so we can do something like this, this will protect all the route comes after this point
router.use(authController.protect);

router.patch('/updateMyPassword', authController.updatePassword);
router.get('/me', userController.getMe, userController.getUser);
router.patch(
  '/updateMe',
  userController.uploadUserPhoto,
  userController.updateMe,
);
router.delete('/deleteMe', userController.deleteMe);

router.use(authController.restrictTo('admin'));
// all the routes comes after this point will be restricted to admin
//users
router
  .route('/')
  .post(userController.uploadUserPhoto, userController.createUser)
  .get(userController.getAllUsers);
router
  .route('/:id')
  .get(userController.getUser)
  .patch(userController.updateUser)
  .delete(userController.deleteUser);

module.exports = router;
