const jwt = require('jsonwebtoken');

const { promisify } = require('util');

const User = require('../models/userModel');
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');
const { decode } = require('punycode');

const signToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};

exports.signup = catchAsync(async (req, res, next) => {
  const newUser = await User.create(req.body);

  const token = signToken(newUser._id);

  res.status(201).json({
    status: 'success',
    token,
    data: {
      user: newUser,
    },
  });
});

exports.login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;

  //check if email and password exits

  if (!email || !password) {
    return next(new AppError('Please provide email and password', 400));
  }

  // check if user exits in db

  const user = await User.findOne({ email }).select('+password');

  // check if password is correct

  if (!user || !(await user.correctPassword(password, user.password))) {
    return next(new AppError('Incorrect email or password', 401));
  }
  const token = signToken(user._id);

  res.status(200).json({
    status: 'success',
    token,
    data: {
      user,
    },
  });
});

exports.protect = catchAsync(async (req, res, next) => {
  // check if the token exist

  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return next(
      new AppError('You are not logged in, Please login to get access', 401),
    );
  }
  // verify the token

  const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);

  // check if user still exits

  const currentUser = await User.findById(decoded.id);

  if (!currentUser) {
    return next(
      new AppError('The user that own this token no longer exist', 401),
    );
  }

  // check if user changed password after token was issued

  if (currentUser.changedPasswordAfter(decoded.iat)) {
    return next(
      new AppError('User recently changed password please login again', 401),
    );
  }

  //grant access to protected route
  req.user = currentUser;
  next();
});

exports.restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(
        new AppError('You do not have permission to perform this action', 403),
      );
    }
    next();
  };
};

exports.forgotPassword = catchAsync(async (req, res, next) => {
  //Get user based on email
  const user = await User.findOne({email: req.body.email})

  if (!user) {
    return next(new AppError('There is no user will that email address', 404))
  }
  console.log('found the user', user)
  //Generate random token
  const resetToken = user.createPasswordResetToken();
  await user.save({validateBeforeSave: false})
  //send to user as an email
});

exports.resetPassword = async (req, res, next) => {};
