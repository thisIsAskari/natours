const crypto = require('crypto');
const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please tell us your name'],
  },
  email: {
    type: String,
    required: [true, 'Please provide your email'],
    unique: true,
    lowercase: true,
    validator: [validator.isEmail, 'Please provide a valid email'],
  },
  photo: String,
  role: {
    type: String,
    enum: ['user', 'guide', 'lead-guide', 'admin'],
    default: 'user',
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
      // this only works on CREATE and SAVE
      validator: function (el) {
        return el === this.password;
      },
      message: 'Passwords are not the same!',
    },
  },
  passwordChangedAt: Date,
  passwordResetToken: String,
  passwordResetExpires: Date,
  active: {
    type: Boolean,
    default: true,
    select: false,
  },
});

userSchema.pre('save', async function (next) {
  // Only run this function if password was actually modified
  // this condition will check if the password was modified or not with other fields,
  // if not(!false make it true) then it will skip further code by calling next()
  if (!this.isModified('password')) return next();

  // Hash the password with cost of 12->cpu intensive process if it is higher
  // using bcryptjs library
  // hash is async function
  this.password = await bcrypt.hash(this.password, 12);
  this.passwordConfirm = undefined; // delete passwordConfirm field from the database
  next();
});

userSchema.pre('save', function (next) {
  // Only run this function if password was actually modified
  if (!this.isModified('password') || this.isNew) return next();

  // Set the passwordChangedAt property to the current date and time
  this.passwordChangedAt = Date.now() - 1000; // subtracting 1 second to make sure that the password changed at is before the token issued at
  next();
});

// this regular expression works with all types of find like findOne, findMany, etc
userSchema.pre(/^find/, function (next) {
  // this will run before every find query
  //this points to current query
  this.find({ active: { $ne: false } });
  next();
});

// instance method
// this method will be available on all instances of the user model
// this method will be used to check if the password is correct or not
userSchema.methods.correctPassword = async function (
  candidatePassword,
  userPassword,
) {
  // this will return true or false
  return await bcrypt.compare(candidatePassword, userPassword);
};

userSchema.methods.changedPasswordAfter = function (JWTTimestamp) {
  if (this.passwordChangedAt) {
    const changedTimestamp = parseInt(
      this.passwordChangedAt.getTime() / 1000,
      10,
    );

    return JWTTimestamp < changedTimestamp; // 100 < 200
  }

  // false means not changed
  return false;
};

userSchema.methods.createPasswordResetToken = function () {
  // generating a random token using crypto library
  // this is unencrypted token
  // this token will be sent to the user email
  const resetToken = crypto.randomBytes(32).toString('hex');

  // hashing the token before saving it to the database
  this.passwordResetToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');
  this.passwordResetExpires = Date.now() + 10 * 60 * 1000;
  console.log({ resetToken }, this.passwordResetToken);
  return resetToken;
};

const User = mongoose.model('User', userSchema);

module.exports = User;
