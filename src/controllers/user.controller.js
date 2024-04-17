import { asyncHandler } from "../utils/asyncHandler.util.js";
import { ApiError } from "../utils/ApiError.util.js";
import { User } from "../models/user.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.util.js";
import { ApiResponse } from "../utils/ApiResponse.util.js";

const registerUser = asyncHandler(async (req, res) => {
  // Get user details from Frontend
  const { username, email, fullName, password } = req.body;
  // console.log("req.body:", req.body);
  // Validation that everything is not empty
  // if (fullName === "")
  //   throw new ApiError(400, "full name is required");
  if (
    [fullName, email, username, password].some((feild) => {
      feild?.trim() === "";
    })
  ) {
    throw new ApiError(400, "All fields are required");
  }

  // Checking if the entered email is valid or not using regEx
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const isValidEmail = (email) => {
    return emailRegex.test(email);
  };
  if (!isValidEmail) {
    throw new ApiError(400, "Enter valid Email");
  }

  // Check if user already exists :Check using username and email
  const existedUser = await User.findOne({
    $or: [{ username }, { email }],
  });

  if (existedUser) {
    throw new ApiError(409, "User with email or username already exists");
  }

  // console.log(req.files);
  // Check for images and check for avatar
  const avatarLocalPath = req.files?.avatar[0]?.path;
  // const coverImageLocalPath = req.files?.coverImage[0]?.path;
  let coverImageLocalPath;
  if (
    req.files &&
    Array.isArray(req.files.coverImage) &&
    req.files.coverImage.length > 0
  ) {
    coverImageLocalPath = req.files.coverImage[0].path;
  }

  if (!avatarLocalPath) {
    throw new ApiError(400, "Avatar File is required");
  }

  // if avatar exists upload it on clodinary, get it's URL and store it in a variable
  const avatar = await uploadOnCloudinary(avatarLocalPath);
  const coverImage = await uploadOnCloudinary(coverImageLocalPath);

  if (!avatar) {
    throw new ApiError(400, "Avatar File is required");
  }

  // create User object - create entry in db
  const user = await User.create({
    fullName: fullName,
    email: email,
    avatar: avatar.url,
    username: username.toLowerCase(),
    coverImage: coverImage?.url || "",
    password: password,
  });
  // remove password and refresh token field from response
  const createdUser = await User.findById(user._id).select(
    "-password -refreshToken" //Fields that i don't want
  );

  // check for user creation
  if (!createdUser) {
    throw new ApiError(500, "Something went wrong while registering the user");
  }

  // return response
  return res
    .status(201)
    .json(new ApiResponse(200, createdUser, "User Registered Successfully!"));
});

export { registerUser };
