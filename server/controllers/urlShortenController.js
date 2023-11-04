//import from urlModel
const Url = require('../models/urlModel');
const CustomError = require('../utils/CustomError');
const asyncErrorHandler = require('../utils/asyncErrorHandler');
const generateRandomString = require('../helper/generateRandomString');
const User = require('../models/userModel');
const ApiFeactures = require('../utils/ApiFeactures');

exports.createShortenUrl = asyncErrorHandler(async (req, res, next) => {
  console.log(req.user);
  const { url, customLink = undefined, password = undefined, limit } = req.body;
  if (
    !url ||
    !(
      url.startsWith('http://') ||
      url.startsWith('https://') ||
      url.startsWith('www')
    )
  ) {
    const err = new CustomError('Please enter a valid url', 400);
    return next(err);
  }
  // check password contain or not

  if (customLink || password || limit) {
    if (!req.user?.isPremium) {
      const err = new CustomError(
        'these feactures are only available for premium users',
        400
      );
      return next(err);
    }
    if (customLink) {
      //chech length of customLink
      if (customLink.length < 3 || is) {
        const err = new CustomError(
          'Custom link must be atleast 3 characters',
          400
        );
        return next(err);
      }
      //check if customLink already exist?
      const isExist = await Url.findOne({ customLink });
      // console.log(isExist?._id.toString());
      if (isExist) {
        const err = new CustomError('Custom link already used', 400);
        return next(err);
      }
    }
    //check password contain or not and length
    if (password) {
      if (password.length < 3) {
        const err = new CustomError(
          'Password must be atleast 3 characters',
          400
        );
        return next(err);
      }
    }
  }
  const shortUrl = generateRandomString(process.env.URL_LENGTH);
  // const user = req.user ? req.user._id : null; // or undefined
  const user_id = req.user?._id;
  console.log(shortUrl);

  const newUrl = await Url.create({
    url,
    customLink,
    shortUrl,
    user_id,
    password,
    limit: limit || 1000,
  });
  const shortenedUrl = `${req.protocol}://${req.get('host')}/url/${shortUrl}`;
  console.log(shortenedUrl);
  res.status(201).json({
    status: 'success',
    data: newUrl,
    shortenedUrl,
  });
});

exports.getAllUrls = asyncErrorHandler(async (req, res, next) => {
  // console.log('here');
  // req.user = user; //for testing
  if (!req.user) {
    const err = new CustomError(
      'only login user can see the generated url',
      400
    );
    return next(err);
  }
  // const user_id = req.user?._id;
  // const apiFeactures = new ApiFeactures(Url.find({ user_id }), req.query)
  //   .filter()
  //   .sort()
  //   .limitFields()
  //   .paginate();
  // const urls = await apiFeactures.query;
  // localhost:3000/api/v1/url?isActive=true&clickCount[gte]=0&limit[lt]=10
  let queryStr = JSON.stringify(req.query);
  queryStr = queryStr.replace(
    /\b(gt|gte|lt|lte|in)\b/g,
    (match) => `$${match}`
  );
  const queryObj = JSON.parse(queryStr);

  let query = Url.find();

  // localhost:3000/api/v1/url?sort=-createdAt,clickCount
  // if (req.query.sort) {
  //   const sortBy = req.query.sort.split(',').join(' ');
  //   query = query.sort(sortBy);
  // } else {
  //   query = query.sort('-createdAt');
  // }

  // if (req.query.fields) {
  //   const fields = req.query.fields.split(',').join(' ');
  //   query = query.select(fields);
  // } else {
  //   query = query.select('-__v');
  // }

  //pagination
  // localhost:3000/api/v1/url?page=2&limit=10
  // const page = req.query.page * 1 || 1;
  // const limit = req.query.limit * 1 || 10;
  // const skip = (page - 1) * limit;
  // query = query.skip(skip).limit(limit);
  // if (req.query.limit) {
  //   const total = await Url.countDocuments();
  //   if (skip >= total) {
  //     const err = new CustomError('This page does not exist', 404);
  //     return next(err);
  //   }
  // }

  const urls = await query;

  // const urls = await Url.find({ user_id: req.user?._id });

  res.status(200).json({
    status: 'success',
    data: urls,
  });
});

exports.getUrl = asyncErrorHandler(async (req, res, next) => {
  //user can request with password or not
  const { shortUrl } = req.params;
  const { password } = req.body;

  let url = await Url.findOne({ shortUrl });
  if (!url) {
    url = await Url.findOne({ customLink: shortUrl });
  }
  if (!url) {
    const err = new CustomError('url not found', 404);
    return next(err);
  }

  if (!url?.isActive) {
    const err = new CustomError('This short url is not active', 400);
    return next(err);
  }

  if (url.limit <= 0) {
    const err = new CustomError('This short url is expired', 400);
    return next(err);
  }

  if (url.password) {
    //if url contain password, need to render password page
    /*if (!password) {
      const err = new CustomError('Please enter password', 400);
      return next(err);
    }*/ // i think it is not necessary
    if (url.password !== password) {
      const err = new CustomError('Password is incorrect', 400);
      return next(err);
    }
  }
  console.log('here');
  let redirectUrl = url.url;
  if (
    !redirectUrl.startsWith('http://') &&
    !redirectUrl.startsWith('https://')
  ) {
    redirectUrl = 'http://' + redirectUrl;
  }
  // res.redirect(redirectUrl);
  url.clickCount++;
  url.limit--;
  await url.save({ validateBeforeSave: false });
  res.status(200).json({
    status: true,
    redirectUrl,
  });
});

exports.deleteUrl = asyncErrorHandler(async (req, res, next) => {
  //find obj_id or shortUrl. i will do something
  // const user = await User.findById({});
  const { shortUrl } = req.params;
  const url = await Url.findOne({ shortUrl });
  if (!url) {
    const err = new CustomError('url not found', 400);
    return next(err);
  }
  console.log(req.user);
  if (req.user?.id.toString() !== url.user_id.toString()) {
    const err = new CustomError('You can delete only your own url', 400);
    return next(err);
  }
  await Url.findByIdAndDelete(url.id);
  if (!url) {
    const err = new CustomError('url not found', 404);
    return next(err);
  }
  res.status(204).json({ status: 'success', message: 'url deleted' });
});

exports.updateUrl = asyncErrorHandler(async (req, res, next) => {
  // req.user = user; //for testing
  const { shortUrl } = req.params;
  const {
    url = undefined,
    customLink = undefined,
    password = undefined,
    isActive = undefined,
  } = req.body;
  const foundUrl = await Url.findOne({ shortUrl });
  if (!foundUrl) {
    const err = new CustomError('URL not found', 404);
    return next(err);
  }

  console.log(foundUrl);

  if (req.user?.id !== foundUrl.user_id.toString()) {
    const err = new CustomError('You can update only your own url', 400);
    return next(err);
  }

  // Build an object with the properties that are present in req.body
  const updateFields = {};
  if (url) updateFields.url = url;

  if (customLink || password) {
    if (!req.user?.isPremium) {
      const err = new CustomError(
        'this feature is only available for premium users',
        400
      );
      return next(err);
    }
    if (customLink) updateFields.customLink = customLink;
    if (password) updateFields.password = password;
  }

  if (isActive) updateFields.isActive = isActive;

  // Use findOneAndUpdate to update the document
  const updatedUrl = await Url.findOneAndUpdate(
    { shortUrl },
    { $set: updateFields },
    { new: true } // To return the updated document
  );

  // Check if the URL was found and updated
  if (!updatedUrl) {
    const err = new CustomError('URL not found', 404);
    return next(err);
  }

  // Send the updated URL as the response
  res.json(updatedUrl);
});