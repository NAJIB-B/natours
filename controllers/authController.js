const jwt = require('jsonwebtoken');

const { promisify } = require('util');
const crypto = require('crypto')

const User = require('../models/userModel');
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');
const sendEmail = require('../utils/email');

const signToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};

const createAndSendToken = (user, statusCode, res) => {
  const token = signToken(user._id);

  res.status(statusCode).json({
    status: 'success', 
    token,
    data : {
      user
    }
  })
}


exports.signup = catchAsync(async (req, res, next) => {
  const newUser = await User.create(req.body);

  createAndSendToken(newUser, 201, res)

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

  createAndSendToken(user, 200, res)
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
  const user = await User.findOne({ email: req.body.email });

  if (!user) {
    return next(new AppError('There is no user will that email address', 404));
  }
  //Generate random token
  const resetToken = user.createPasswordResetToken();

  //Save token in database so you can later get user with token
  await user.save({ validateBeforeSave: false });
  //send to user as an email
  const resetURL = `${req.protocol}://${req.get('host')}/api/v1/users/resetPassword/${resetToken}`;

  const message = `Forgot your password? Submit a PATCH request with your new password and
  PasswordConfirm to: ${resetURL}.\nIf you didn't forget your password please ignore this mail`;

  try {
    await sendEmail({
      email: user.email,
      subject: 'Your password reset token (valid for 10 min)',
      message,
    });
  } catch (error) {
    console.log(error);
    user.createPasswordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save({ validateBeforeSave: false });

    return next(
      new AppError(
        'There was an error sending the email. Try again later',
        500,
      ),
    );
  }

  return res.status(200).json({
    status: 'success',
    message: 'Token sent to email',
  });
});

exports.resetPassword = catchAsync(async (req, res, next) => {
  //Get user based on token

  const hashedToken = crypto
    .createHash('sha256')
    .update(req.params.token)
    .digest('hex');

  const user = await User.findOne(
    { passwordResetToken: hashedToken,
      passwordResetExpires: {$gt: Date.now()}},
  );

  if (!user) {
    return next(new AppError('Token is invalid or expired', 400));
  }

  
  //if there is a user and token is not expired, set new password


  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;

  //update ChangePasswordAt for the user

  await user.save();

  //log user in

  createAndSendToken(user, 200, res)
});


exports.updatePassword = catchAsync( async (req, res, next) => {

  // Get user from collection
  const candidatePassword  = req.body.currentPassword 
  const user = await User.findById(req.user._id).select('+password')
  
  // Check if POSTed current password is correct
const correctPassword = await user.correctPassword(candidatePassword, user.password) 

  
  if (!correctPassword) {
    return next(new AppError('Your current password is wrong', 401))
  }

  // If so, update password

  user.password = req.body.newPassword;
  user.passwordConfirm = req.body.newPasswordConfirm

  await user.save()
  // Log user in, send JWT

  createAndSendToken(user, 200, res)
})
