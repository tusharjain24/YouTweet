import { asyncHandler } from "../utils/asyncHandler.util.js";
import { ApiError } from "../utils/ApiError.util.js";
import { User } from "../models/user.model.js";
import {
  uploadOnCloudinary,
  deleteOldImage,
} from "../utils/cloudinary.util.js";
import { ApiResponse } from "../utils/ApiResponse.util.js";
import jwt from "jsonwebtoken";
import Mongoose from "mongoose";

const generateAccessAndRefreshToken = async (userId) => {
  try {
    const user = await User.findById(userId);
    const accessToken = await user.generateAccessToken();
    const refreshToken = await user.generateRefreshToken();
    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });
    return { accessToken, refreshToken };
  } catch (error) {
    throw new ApiError(
      500,
      "Something went wrong while generating refresh and access tokens"
    );
  }
};

const refreshAccessToken = asyncHandler(async (req, res) => {
  const incomingRefreshToken =
    req.cookies.refreshToken || req.body.refreshToken;

  if (!incomingRefreshToken) {
    throw new ApiError(401, "unauthorized request");
  }

  try {
    const decoddedIncomingRefreshToken = jwt.verify(
      incomingRefreshToken,
      process.env.REFRESH_TOKEN_SECRET
    );

    const user = await User.findById(decoddedIncomingRefreshToken?._id);

    if (!user) {
      throw new ApiError(401, "unauthorized request");
    }
    if (incomingRefreshToken != user?.refreshToken) {
      throw new ApiError(401, "Refresh token is expired or used");
    }
    const options = {
      httpOnly: true,
      secure: true,
    };

    const { accessToken, newRefreshToken } =
      await generateAccessAndRefreshToken(user._id);

    return res
      .status(200)
      .cookie("accessToken", accessToken, options)
      .cookie("refreshToken", newRefreshToken, options)
      .json(
        new ApiResponse(
          200,
          { accessToken, refreshToken: newRefreshToken },
          "Access Token Refreshed Successfully"
        )
      );
  } catch (error) {
    throw new ApiError(
      401,
      "refresh token Invalid or expired" || error?.message
    );
  }
});

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
  console.log(avatar.url);
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

const loginUser = asyncHandler(async (req, res) => {
  // Get data from the browser(frontend)
  const { username, email, password } = req.body;
  // console.log(username, email, password);
  // console.log("reached here");

  // check if the data recieved is not empty
  if (!username && !email) {
    throw new ApiError(400, "username or email is required");
  }
  if (!password) {
    throw new ApiError(400, "password is required");
  }

  // check the given username and password with those present in database using already defined method iscorrect password
  const existedUser = await User.findOne({ $or: [{ username }, { email }] });
  if (!existedUser) {
    throw new ApiError(404, "User does not exist");
  }
  // Password Check
  const isPasswordValid = await existedUser.isPasswordCorrect(password);
  if (!isPasswordValid) {
    throw new ApiError(401, "Invalid user credentials");
  }

  // Generate refresh and access tokens
  const { accessToken, refreshToken } = await generateAccessAndRefreshToken(
    existedUser._id
  );

  // remove password and refresh token field from response
  const loggedInUser = await User.findById(existedUser._id).select(
    "-password -refreshToken" //Fields that i don't want
  );

  // To make sure the cookies are only modified by server. Frontend can only access it. We do this because cookies are by default modifiabe from frontend as well
  // send cookies(information to be sent to user)
  const options = {
    httpOnly: true,
    secure: true,
  };

  res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
      new ApiResponse(
        200,
        { user: loggedInUser, accessToken, refreshToken },
        "user logged in successfully"
      )
    );

  // if given credentials are correct then send then go to home page and console log (Login Successful)
});

const logOutUser = asyncHandler(async (req, res) => {
  await User.findByIdAndUpdate(
    req.user._id,
    {
      $unset: {
        refreshToken: 1,
      },
    },
    {
      new: true,
    }
  );

  const options = {
    httpOnly: true,
    secure: true,
  };

  res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(new ApiResponse(200, {}, "user logged out successfully"));
});

const changeCurrentPassword = asyncHandler(async (req, res) => {
  console.log(req.body);
  const { oldPassword, newPassword } = req.body;
  const user = await User.findById(req.user?._id);
  const isPasswordCorrect = await user.isPasswordCorrect(oldPassword);
  if (!isPasswordCorrect) {
    throw new ApiError(400, "Invalid Old Password");
  }
  if (oldPassword == newPassword) {
    throw new ApiError(400, "Old password and new Password cannot be same");
  }
  user.password = newPassword;
  await user.save({ validateBeforeSave: false });

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Password has been changed successfully"));
});

const getCurrentUser = asyncHandler(async (req, res) => {
  return res
    .status(200)
    .json(200, req.user, "Current user fetched successfully");
});

const updateAccountDetails = asyncHandler(async (req, res) => {
  const { fullName, email, username } = req.body;
  if (!(fullName && email && username)) {
    throw new ApiError(401, "All fields are required");
  }

  const modifiedFields = [];

  const user = await User.findById(req.user?._id);
  if (fullName != user.fullName) {
    user.fullName = fullName;
    modifiedFields.push("fullName");
  }

  if (email != user.email) {
    user.email = email;
    modifiedFields.push("email");
  }
  if (username != user.username) {
    console.log(user.username);
    console.log(username);
    const isUsernameUnique = await User.findOne({ username });
    if (isUsernameUnique) {
      throw new ApiError(404, "Username already exists");
    }
    user.username = username;
    modifiedFields.push("username");
  }

  await user.save({ validateBeforeSave: false });
  return res
    .status(200)
    .json(new ApiResponse(200, user, "All fields have been update"));
});

const updateAvatar = asyncHandler(async (req, res) => {
  const newAvatarLocalPath = req.file?.path;
  // console.log(req.file);

  if (!newAvatarLocalPath) {
    throw new ApiError(400, "avatar file is missing.");
  }

  const cloudinaryAvatarURI = await uploadOnCloudinary(newAvatarLocalPath);

  if (!cloudinaryAvatarURI) {
    throw new ApiError(400, "Error while uploading avatar on cloudinary");
  }

  // Methodology to delete the old image
  const user = await User.findById(req.user?._id).select("-password");
  const oldAvatarImagePath = user?.avatar;
  // console.log("> user_ctrl > oldImagePath: " + oldImagePath);
  // console.log(">user_ctrl > newImagePath: " + cloudinaryAvatarURI);
  const updatedUser = await User.findByIdAndUpdate(
    user._id,
    {
      $set: {
        avatar: cloudinaryAvatarURI.url,
      },
    },
    { new: true }
  ).select("-password -refreshToken");
  deleteOldImage(oldAvatarImagePath);

  return res
    .status(200)
    .json(new ApiResponse(200, { updatedUser }, "Avatar has been updated"));
});

const updateCoverImage = asyncHandler(async (req, res) => {
  // console.log(req.file);
  const newCoverImageLocalPath = req.file?.path;
  if (!newCoverImageLocalPath) {
    throw new ApiError(400, "Cover Image file is missing.");
  }

  const cloudinaryCoverImageURI = await uploadOnCloudinary(
    newCoverImageLocalPath
  );
  // console.log(cloudinaryCoverImageURI);

  if (!cloudinaryCoverImageURI) {
    throw new ApiError(400, "Error while uploading avatar on cloudinary");
  }

  const user = await User.findById(req.user?._id).select("-password");
  const oldCoverImagePath = user?.coverImage;

  const updatedUser = await User.findByIdAndUpdate(
    req.user?._id,
    {
      $set: {
        coverImage: cloudinaryCoverImageURI.url,
      },
    },
    { new: true } // returns the updated information
  ).select("-password -refreshToken");
  deleteOldImage(oldCoverImagePath);

  return res
    .status(200)
    .json(
      new ApiResponse(200, { updatedUser }, "Cover Image has been updated")
    );
});

const getUserChannelProfile = asyncHandler(async (req, res) => {
  const { username } = req.params;
  // console.log(username);
  if (!username?.trim()) {
    throw new ApiError(400, "username is missing");
  }

  const channel = await User.aggregate([
    {
      $match: {
        username: username?.toLowerCase(),
      },
    },
    {
      $lookup: {
        from: "subscriptions",
        localField: "_id",
        foreignField: "channel",
        as: "subscribers",
      },
    },
    {
      $lookup: {
        from: "subscriptions",
        localField: "_id",
        foreignField: "subscriber",
        as: "subscribedTo",
      },
    },
    {
      $addFields: {
        subscribersCount: {
          $size: "$subscribers",
        },
        channelsSubscribedToCount: {
          $size: "$subscribedTo",
        },
        isSubscribed: {
          $cond: {
            if: { $in: [req.user?._id, "$subscribers.subscriber"] }, // $in operators can be used for both arrays and objects. Here we are using it to look into objects
            then: true,
            else: false,
          },
        },
      },
    },
    {
      $project: {
        fullName: 1,
        username: 1,
        subscribersCount: 1,
        channelsSubscribedToCount: 1,
        isSubscribed: 1,
        avatar: 1,
        coverImage: 1,
        email: 1,
        createdAt: 1,
      },
    },
  ]);

  if (!channel?.length) {
    throw new ApiError(404, "Channel does not exist");
  }
  return res
    .status(200)
    .json(
      new ApiResponse(200, channel[0], "User channel fetched successfully")
    );
});

const getUserWatchHistory = asyncHandler(async (req, res) => {
  console.log(req.user);
  const user = await User.aggregate([
    {
      $match: {
        _id: new Mongoose.Types.ObjectId(req.user._id),
      },
    },
    {
      $lookup: {
        from: "videos",
        localField: "watchHistory",
        foreignField: "_id",
        as: "watchHistory",
        pipeline: [
          {
            $lookup: {
              from: "users",
              localField: "owner",
              foreignField: "_id",
              as: "owner",
              pipeline: [
                {
                  $project: {
                    fullName: 1,
                    username: 1,
                    avatar: 1,
                  },
                },
              ],
            },
          },
          {
            $addFields: {
              owner: {
                $first: "$owner",
              },
            },
          },
        ],
      },
    },
  ]);

  return res
    .status(200)
    .json(
      new ApiResponse(200, user[0].watchHistory, "User's Watch History fetched")
    );
});

export {
  registerUser,
  loginUser,
  logOutUser,
  refreshAccessToken,
  changeCurrentPassword,
  getCurrentUser,
  updateAccountDetails,
  updateAvatar,
  updateCoverImage,
  getUserChannelProfile,
  getUserWatchHistory,
};
