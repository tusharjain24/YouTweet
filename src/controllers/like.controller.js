import mongoose, { isValidObjectId } from "mongoose";
import { Like } from "../models/like.model.js";
import { ApiError } from "../utils/ApiError.util.js";
import { ApiResponse } from "../utils/ApiResponse.util.js";
import { asyncHandler } from "../utils/asyncHandler.util.js";

const toggleVideoLike = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  //TODO: toggle like on video
  if (!videoId) {
    throw new ApiError(400, "Bad Request: Video ID is required");
  }

  const userId = req.user?._id;
  if (!userId) {
    throw new ApiError(400, "Unauthorized Request");
  }

  const existingVideoLike = await Like.findOne({
    video: videoId,
    likedBy: userId,
  });

  let message;
  let actiontaken;

  if (!existingVideoLike) {
    actiontaken = await Like.create({
      video: videoId,
      likedBy: userId,
    });
    message = "Video has been liked by the user";
  } else {
    actiontaken = await Like.deleteOne(existingVideoLike._id);
    message = "Video has been unliked by the user";
  }

  return res.status(200).json(new ApiResponse(200, actiontaken, message));
});

const toggleCommentLike = asyncHandler(async (req, res) => {
  //TODO: toggle like on comment
  const { commentId } = req.params;
  if (!commentId) {
    throw new ApiError(400, "Bad Request: Comment ID is required");
  }

  const userId = req.user?._id;
  if (!userId) {
    throw new ApiError(400, "Unauthorized Request");
  }

  const existingCommentLike = await Like.findOne({
    comment: commentId,
    likedBy: userId,
  });

  let message;
  let actiontaken;

  if (!existingCommentLike) {
    actiontaken = await Like.create({
      comment: commentId,
      likedBy: userId,
    });
    message = "Comment has been liked by the user";
  } else {
    actiontaken = await Like.deleteOne(existingCommentLike._id);
    message = "Comment has been unliked by the user";
  }

  return res.status(200).json(new ApiResponse(200, actiontaken, message));
});

const toggleTweetLike = asyncHandler(async (req, res) => {
  //TODO: toggle like on tweet
  const { tweetId } = req.params;
  if (!tweetId) {
    throw new ApiError(400, "Bad Request: Comment ID is required");
  }

  const userId = req.user?._id;
  if (!userId) {
    throw new ApiError(400, "Unauthorized Request");
  }

  const existingCommentLike = await Like.findOne({
    tweet: tweetId,
    likedBy: userId,
  });

  let message;
  let actiontaken;

  if (!existingCommentLike) {
    actiontaken = await Like.create({
      tweet: tweetId,
      likedBy: userId,
    });
    message = "Tweet has been liked by the user";
  } else {
    actiontaken = await Like.deleteOne(existingCommentLike._id);
    message = "Tweet has been unliked by the user";
  }

  return res.status(200).json(new ApiResponse(200, actiontaken, message));
});

const getLikedVideos = asyncHandler(async (req, res) => {
  //TODO: get all liked videos
  const userId = req.user?._id;

  if (!userId) {
    throw new ApiError(400, "Bad Request: User is required to Log In");
  }

  const likedVideos = await Like.find({
    likedBy: userId,
    video: { $exists: true },
  }).select("-createdAt -updatedAt -v");

  if (!likedVideos) {
    throw new ApiError(
      400,
      "Something went wrong or User has not liked any videos"
    );
  }

  return res
    .status(200)
    .json(
      new ApiResponse(200, likedVideos, "Videos liked by user has been fetched")
    );
});

export { toggleCommentLike, toggleTweetLike, toggleVideoLike, getLikedVideos };
