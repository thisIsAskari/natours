const express = require('express');
const viewsController = require('../controllers/viewsController');
const authController = require('../controllers/authController');

const router = express.Router();

//render will goes in views folder that we defined above and pick the file name we passed
//in this case it is base.pug
// router.get('/', (req, res) => {
//   res.status(200).render('base', {
//     tour: 'The Forest Hiker',
//     user: 'Askari',
//   });
// });
router.get('/me', authController.protect, viewsController.getAccount);

router.use(authController.isLoggedIn);
router.get('/', viewsController.getOverview);
router.get('/tour', viewsController.getTour);
router.get('/tour/:slug', viewsController.getTour);
router.get('/login', viewsController.getLoginForm);

module.exports = router;
