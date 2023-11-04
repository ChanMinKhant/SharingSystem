const User = require('../models/userModel');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const CustomError = require('../utils/CustomError');
const Token = require('../models/tokenModel');
const asyncErrorHandler = require('../utils/asyncErrorHandler');
const {
  signToken,
  saveToken,
  emailTemplate,
  sendEmail,
} = require('../utils/index');

exports.register = asyncErrorHandler(async (req, res, next) => {
  const { username, email, password, confirmPassword } = req.body;
  if (password !== confirmPassword) {
    const err = new CustomError('Password does not match', 400);
    return next(err);
  }
  // const isExisting = await User.findOne({ email });
  // if (isExisting) {
  //   const err = new CustomError('Email already exists', 400);
  //   return next(err);
  // }
  const user = await User.create({ username, email, password });
  const accessToken = signToken(user.id);
  res.cookie('jwt', accessToken, {
    httpOnly: true,
    maxAge: 1000 * 60 * 60 * 24 * parseInt(process.env.EXPIRES_IN || 7),
  });
  saveToken(user._id, accessToken);
  res.status(201).json({
    status: 'success',
    user,
    message: 'User created successfully',
    accessToken,
  });
});

exports.login = asyncErrorHandler(async (req, res, next) => {
  //if cookie exists, cant login
  // if (req.cookies?.jwt) {
  //   const err = new CustomError('You are already logged in', 400);
  //   return next(err);
  // }
  const { email, password } = req.body;

  if (!email) {
    const err = new CustomError('Please provide email', 400);
    return next(err);
  }
  if (!password) {
    const err = new CustomError('Please provide password', 400);
    return next(err);
  }
  const user = await User.findOne({ email }).select('+password');
  if (!user) {
    //custom error handler
    const err = new CustomError('This email is not registered', 404);
    return next(err);
  }

  if (!(await user.comparePassword(password, user.password))) {
    //custom error handler later
    const err = new CustomError('Incorrect password', 401);
    return next(err);
  }

  const accessToken = signToken(user.id);
  res.cookie('jwt', accessToken, {
    httpOnly: true,
    maxAge: 1000 * 60 * 60 * 24 * parseInt(process.env.EXPIRES_IN || 7),
  });
  saveToken(user._id, accessToken);
  res.status(200).json({
    status: 'success',
    accessToken,
    message: 'User logged in successfully',
  });
});

exports.logout = asyncErrorHandler(async (req, res, next) => {
  const cookie = req.cookies;
  if (!cookie?.jwt) return res.sendStatus(204); //no content
  const accessToken = cookie.jwt;
  const foundUser = await Token.findOne({ token: accessToken });
  if (!foundUser) {
    return res.sendStatus(401); //unauthorized
  }
  //delete refresh token from db
  await Token.findOneAndDelete({ token: accessToken });
  //clear cookie
  res.clearCookie('jwt');
  res.sendStatus(204); //no content
});

exports.forgotPassword = asyncErrorHandler(async (req, res, next) => {
  const { email } = req.body;
  if (!email) {
    const err = new CustomError('Please provide email', 400);
    return next(err);
  }
  const user = await User.findOne({ email });
  if (!user) {
    const err = new CustomError('This email is not registered', 404);
    return next(err);
  }
  const resetToken = user.createPasswordResetToken();

  await user.save({ validateBeforeSave: false });
  //send email with reset token
  //it should be something url
  const resetURL = `${req.protocol}://${req.get(
    'host'
  )}/auth/resetpassword/${resetToken}`;
  const message = emailTemplate(resetURL, user?.username);

  try {
    sendEmail({
      email: user.email,
      subject: 'Reset Your Password',
      message,
    });
  } catch (error) {
    user.passwordResetToken = undefined;
    user.passwordResetExpiresAt = undefined;
    await user.save({ validateBeforeSave: false });
    return next(new CustomError('Email could not be sent', 500));
  }

  res.status(200).json({
    status: 'success',
    message: 'Reset token sent to email',
    resetURL,
  });
});

exports.resetPassword = asyncErrorHandler(async (req, res, next) => {
  const { resetToken } = req.params;
  const hashedToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');
  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpiresAt: { $gt: Date.now() },
  });
  if (!user) {
    const err = new CustomError('Token is invalid or has expired', 400);
    return next(err);
  }
  const { password, confirmPassword } = req.body;
  if (!password || !confirmPassword) {
    const err = new CustomError('Please provide password', 400);
    return next(err);
  }
  if (password !== confirmPassword) {
    const err = new CustomError('Password does not match', 400);
    return next(err);
  }
  user.passwordResetToken = undefined;
  user.passwordResetExpiresAt = undefined;
  user.password = password;
  user.passwordChangedAt = Date.now();
  await user.save();
  res.status(200).json({
    status: 'success',
    message: 'Password reset successfully',
  });
});

exports.changePassword = asyncErrorHandler(async (req, res, next) => {
  if (!req.user)
    return next(new CustomError('Please login to change password', 401));
  const { currentPassword, newPassword, confirmPassword } = req.body;
  if (!currentPassword) {
    const err = new CustomError('Please provide current password', 400);
    return next(err);
  }
  const user = await User.findById(req.user.id).select('+password');
  if (!(await user.comparePassword(currentPassword, user.password))) {
    const err = new CustomError('Incorrect password', 401);
    return next(err);
  }
  if (!newPassword) {
    const err = new CustomError('Please provide new password', 400);
    return next(err);
  }
  if (!confirmPassword) {
    const err = new CustomError('Please confirm new password', 400);
    return next(err);
  }
  if (newPassword !== confirmPassword) {
    const err = new CustomError('Password does not match', 400);
    return next(err);
  }
  if (currentPassword === newPassword) {
    const err = new CustomError('You cannot use this password', 400);
    return next(err);
  }

  user.password = newPassword;
  user.passwordChangedAt = Date.now();
  await user.save();
  res.status(200).json({
    status: 'success',
    message: 'Password changed successfully',
  });
});

exports.logoutAllDevices = asyncErrorHandler(async (req, res, next) => {
  const currentToken = req?.cookies?.jwt; // i am not sure authorization or cookie when i use frontend

  await Token.deleteMany({
    user_id: req.user.id,
    token: { $ne: currentToken },
  });

  res.status(200).json({ message: 'Logged out from all devices.' });
});
