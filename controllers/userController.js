const catchAsync = require('../utils/catchAsync')
const User = require('../models/userModel')


exports.getAllUsers = catchAsync( async(req, res, next) => {

  const users = await User.find(); 

  res.status(200).json({
    status : 'success',
    result : users.length,
    data : {
      users
    }
  })
})
exports.getUser = (req, res) => {
  res.status(500).json({
    status : 'error',
    message : 'This route is yet to be implemented'
  })
}

exports.createUser = (req, res) => {
  res.status(500).json({
    status : 'error',
    message : 'This route is yet to be implemented'
  })
}

exports.updateUser = (req, res) => {
  res.status(500).json({
    status : 'error',
    message : 'This route is yet to be implemented'
  })
}

exports.deleteUser = (req, res) => {
  res.status(500).json({
    status : 'error',
    message : 'This route is yet to be implemented'
  })
}

