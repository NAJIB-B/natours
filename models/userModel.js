const mongoose = require('mongoose');
const validator = require('validator');

const bcrypt = require('bcryptjs')
const crypto = require('crypto')

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'A user must have a name'],
  },

  email: {
    type: String,
    required: [true, 'A user must have an email'],
    unique: true,
    lowercase: true,
    validate: [validator.isEmail, 'Email must be valid'],
  },

  photo: String,

  role: {
    type: String,
    enum: ['user', 'guide', 'lead-guide', 'admin'],
    default: 'user'
  },

  password: {
    type: String,
    required: [true, 'Please provide a password'],
    minlength: 8,

    select: false,
  },

  passwordConfirm: {
    type: String,
    required: [true, 'Please confirm your password'],
    validate: {
      //This only works on SAVE and CREATE
      validator: function (el) {
        return el === this.password;
      },
      message: 'Passwords are not the same',
    },
  },
  passwordChangedAt: Date,

  passwordResetToken: String,
  passwordResetExpires: Date,
});


userSchema.pre('save', async function(next) {
  //only run if password was modified
  if (!this.isModified('password')) return next();

  this.password = await bcrypt.hash(this.password, 12)

  this.passwordConfirm = undefined

  next();

})

userSchema.pre('save', function(next) {
  if (!this.isModified('password') || this.isNew) return next()
    
  this.passwordChangedAt = Date.now() - 1000;

  next();

  
})

userSchema.methods.correctPassword = async function(candidatePassword, userPassword) {
  return await bcrypt.compare(candidatePassword, userPassword)
}

userSchema.methods.changedPasswordAfter = function(JWTTimesStamp) {

  if (this.passwordChangedAt) {

    const changedTimestamp = parseInt(this.passwordChangedAt.getTime() / 1000, 10)

    console.log(this.passwordChangedAt, JWTTimesStamp)

    return JWTTimesStamp < changedTimestamp

  } 
  return false
}

userSchema.methods.createPasswordResetToken = function() {
  const resetToken = crypto.randomBytes(32).toString('hex')

  this.passwordResetToken = crypto.createHash('sha256').update(resetToken).digest('hex')

  console.log({resetToken}, this.passwordResetToken )

  this.passwordResetExpires = Date.now() + 10 * 60 * 1000


  return resetToken;
}

const User = mongoose.model('User', userSchema);

module.exports = User;
