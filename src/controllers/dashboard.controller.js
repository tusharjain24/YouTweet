import mongoose from "mongoose";
import { Video } from "../models/video.model.js";
import { Subscription } from "../models/subscription.model.js";
import { Like } from "../models/like.model.js";
import { ApiError } from "../utils/ApiError.util.js";
import { ApiResponse } from "../utils/ApiResponse.util.js";
import { asyncHandler } from "../utils/asyncHandler.util.js";
import { User } from "../models/user.model.js";

const getChannelStats = asyncHandler(async (req, res) => {
  // TODO: Get the channel stats like total video views, total subscribers, total videos, total likes etc.
  const userId = req.user?._id;
  console.log(userId);
  if (!userId) {
    throw new ApiError(400, "Unauthorized Request");
  }

  const channelStats = await User.aggregate([
    {
      $match: {
        _id: userId,
      },
    },
    {
      $lookup: {
        from: "videos",
        localField: "_id",
        foreignField: "owner",
        as: "videos",
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
        from: "likes",
        localField: "_id",
        foreignField: "likedBy",
        as: "likes",
      },
    },
    {
      $addFields: {
        totalSubscribers: {
          $size: "$subscribers",
        },
        totalLikes: {
          $size: "$likes",
        },
        totalVideos: {
          $size: "$videos",
        },
      },
    },
    {
      $unwind: {
        path: "$videos",
        preserveNullAndEmptyArrays: true,
      },
    },
    {
      $group: {
        _id: "$_id",
        fullName: { $first: "$fullName" },
        username: { $first: "$username" },
        totalSubscribers: { $first: "$totalSubscribers" },
        totalLikes: { $first: "$totalLikes" },
        totalVideos: { $first: "$totalVideos" },
        totalVideoViews: { $sum: "$videos.views" },
        videos: { $push: "$videos" },
      },
    },
    {
      $project: {
        fullName: 1,
        username: 1,
        totalSubscribers: 1,
        totalVideos: 1,
        totalVideoViews: 1,
        videos: 1,
        totalLikes: 1,
      },
    },
  ]);

  if (!channelStats || channelStats.length === 0) {
    throw new ApiError(
      400,
      "Something went wrong while fetching the stats from the Database"
    );
  }

  return res
    .status(200)
    .json(
      new ApiResponse(200, channelStats, "Channel Stats have been fetched")
    );
});

const getChannelVideos = asyncHandler(async (req, res) => {
  // TODO: Get all the videos uploaded by the channel
  const userId = req.user?._id;

  if (!userId) {
    throw new ApiError(400, "Bad Request: Unauthorized Access");
  }

  const channelVideos = await Video.find({ owner: userId });

  if (!channelVideos) {
    throw new ApiError(
      400,
      "Something went wrong while fetching the videos fro the database "
    );
  }

  return res
    .status(200)
    .json(
      new ApiResponse(200, channelVideos, "Fetched Channel Videos Successfully")
    );
});

export { getChannelStats, getChannelVideos };
