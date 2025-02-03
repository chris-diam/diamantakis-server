// src/controllers/userController.js
import catchAsync from "../utils/catchAsync.js";
import ApiError from "../utils/ApiError.js";
import { userService } from "../services/userService.js";

export const signup = catchAsync(async (req, res) => {
  const user = await userService.createUser(req.body);
  const token = userService.generateToken(user._id);

  // Remove password from output
  user.password = undefined;

  res.status(201).json({
    status: "success",
    token,
    data: { user },
  });
});

export const login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return next(new ApiError(400, "Please provide email and password"));
  }

  const user = await userService.validateUser(email, password);

  if (!user) {
    return next(new ApiError(401, "Incorrect email or password"));
  }

  const token = userService.generateToken(user._id);

  res.status(200).json({
    status: "success",
    token,
  });
});

export const getMe = catchAsync(async (req, res) => {
  res.status(200).json({
    status: "success",
    data: { user: req.user },
  });
});

export const updateMe = catchAsync(async (req, res) => {
  // Don't allow password updates here
  if (req.body.password) {
    throw new ApiError(
      400,
      "This route is not for password updates. Please use /updatePassword"
    );
  }

  const user = await userService.updateUser(req.user.id, req.body);

  res.status(200).json({
    status: "success",
    data: { user },
  });
});
