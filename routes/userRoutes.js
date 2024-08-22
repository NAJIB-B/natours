const express = require('express');


const {getAllUsers, getUser, getMe, createUser, updateUser, deleteUser, updateMe, deleteMe} = require('../controllers/userController')
const {signup, login, forgotPassword, resetPassword, updatePassword, protect, restrictTo} = require('../controllers/authController')

const router = express.Router();

router.post('/signup', signup);
router.post('/login', login);
router.post('/forgotPassword', forgotPassword);
router.patch('/resetPassword/:token', resetPassword);

//Protect All route below
router.use(protect)

router.patch('/updatePassword', updatePassword)

router.get('/me', getMe, getUser)
router.patch('/updateMe', updateMe)
router.delete('/deleteMe', deleteMe)

//Restrict all routes below to admin
router.use(restrictTo('admin'))

router.route('/').get(getAllUsers).post(createUser);
router.route('/:id').get(getUser).patch(updateUser).delete(deleteUser);



module.exports = router;

