const express = require('express');
const viewsController = require('../controllers/viewsController');

const router = express.Router();

//render will goes in views folder that we defined above and pick the file name we passed
//in this case it is base.pug
// router.get('/', (req, res) => {
//   res.status(200).render('base', {
//     tour: 'The Forest Hiker',
//     user: 'Askari',
//   });
// });

router.get('/', viewsController.getOverview);
router.get('/tour', viewsController.getTour);

module.exports = router;
