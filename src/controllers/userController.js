// src/controllers/userController.js
import catchAsync from "../utils/catchAsync.js";
import ApiError from "../utils/ApiError.js";
import User from "../models/User.js";
import { generateToken } from "../utils/jwt.js";

export const signup = catchAsync(async (req, res) => {
  const { name, email, password, username, displayName } = req.body;

  // Check if user already exists
  const existingUser = await User.findOne({
    $or: [
      { email: email.toLowerCase() },
      { username: username?.toLowerCase() },
    ],
  });

  if (existingUser) {
    throw new ApiError(
      400,
      existingUser.email === email.toLowerCase()
        ? "Email already registered"
        : "Username already taken"
    );
  }

  const user = await User.create({
    name,
    email,
    password,
    username,
    displayName: displayName || username,
  });

  // Remove password from output
  user.password = undefined;

  // Generate token
  const token = generateToken(user._id);

  res.status(201).json({
    status: "success",
    token,
    data: { user },
  });
});

export const login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password) {
    throw new ApiError(400, "Please provide email and password");
  }

  const user = await User.findOne({ email }).select("+password");

  if (!user || !(await user.correctPassword(password, user.password))) {
    throw new ApiError(401, "Incorrect email or password");
  }

  // Remove password from output
  user.password = undefined;

  const token = generateToken(user._id);

  res.status(200).json({
    status: "success",
    token,
    data: { user },
  });
});

export const getMe = catchAsync(async (req, res) => {
  // req.user is already available because of the protect middleware
  const user = await User.findById(req.user._id);

  res.status(200).json({
    status: "success",
    data: { user },
  });
});

export const updateMe = catchAsync(async (req, res) => {
  // 1) Create error if user POSTs password data
  if (req.body.password || req.body.passwordConfirm) {
    throw new ApiError(
      400,
      "This route is not for password updates. Please use /updatePassword"
    );
  }

  // 2) Filter unwanted fields that are not allowed to be updated
  const filteredBody = filterObj(req.body, "name", "email", "displayName");

  // 3) Update user document
  const updatedUser = await User.findByIdAndUpdate(req.user._id, filteredBody, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({
    status: "success",
    data: { user: updatedUser },
  });
});

// Helper function to filter object
const filterObj = (obj, ...allowedFields) => {
  const newObj = {};
  Object.keys(obj).forEach((el) => {
    if (allowedFields.includes(el)) newObj[el] = obj[el];
  });
  return newObj;
};
