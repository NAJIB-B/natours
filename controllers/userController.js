const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const User = require('../models/userModel');
const factory = require('./handlerFactory')

const filterObj = (obj, ...fileds) => {
  const filteredObj = {};

  Object.keys(obj).forEach((el) => {
    if (fileds.includes(el)) filteredObj[el] = obj[el];
  });

  return filteredObj;
};

exports.getAllUsers = factory.getAll(User)

exports.updateMe = catchAsync(async (req, res, next) => {
  //create error if user POSTS password data

  if (req.body.password || req.body.passwordConfirm) {
    return next(
      new AppError(
        'This route is not for password updates. Please use /updatePassword',
      ),
    );
  }
  //update user document

  const filteredBody = filterObj(req.body, 'name', 'email');
  console.log(req.user._id, filteredBody)
  
  // find by id and update uses normal object no need to stringify it
  const updatedUser = await User.findByIdAndUpdate(req.user._id, filteredBody, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({
    status: 'success',
    data: {
      updatedUser,
    },
  });
});


exports.getMe = (req, res, next) => {
  req.params.id = req.user.id
  next()
}

exports.deleteMe = catchAsync( async(req, res, next) => {
  await User.findByIdAndUpdate(req.user._id, {active: false})

  res.status(204).json({
    status: 'success',
    data: null

  })
})

exports.getUser = factory.getOne(User) 

exports.createUser = (req, res) => {
  res.status(500).json({
    status: 'error',
    message: 'This route is not defined! Please use sign up instead',
  });
};

exports.updateUser = factory.updateOne(User);

exports.deleteUser = factory.deleteOne(User);
