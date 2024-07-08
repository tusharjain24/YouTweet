import mongoose, { isValidObjectId } from "mongoose";
import { User } from "../models/user.model.js";
import { Subscription } from "../models/subscription.model.js";
import { ApiError } from "../utils/ApiError.util.js";
import { ApiResponse } from "../utils/ApiResponse.util.js";
import { asyncHandler } from "../utils/asyncHandler.util.js";

const toggleSubscription = asyncHandler(async (req, res) => {
  const { subscriberId } = req.params;
  const userId = req.user?._id;

  if (!userId) {
    throw new ApiError(400, "Unauthorised Request");
  }

  if (!subscriberId) {
    throw new ApiError(400, "Bad Request: Channel ID is required");
  }

  const existingSubscription = await Subscription.findOne({
    subscriber: userId,
    channel: subscriberId,
  });

  let message;
  let subscription;

  if (existingSubscription) {
    subscription = await Subscription.deleteOne({
      _id: existingSubscription._id,
    });
    message = "Subscription has been removed";
  } else {
    subscription = await Subscription.create({
      subscriber: userId,
      channel: subscriberId,
    });
    message = "Subscription has been added";
  }

  return res.status(200).json(new ApiResponse(200, subscription, message));
});

// controller to return list of users subscribed to the channel
const getUserChannelSubscribers = asyncHandler(async (req, res) => {
  const { channelId } = req.params;
  console.log(channelId);
  const userId = req.user?._id;

  if (!userId) {
    throw new ApiError(400, "Bad Request: User is required to LOG IN");
  }

  if (!channelId) {
    throw new ApiError(400, "Bad Request: Channel ID is required");
  }

  const subscribers = await Subscription.find({ channel: channelId });
  // console.log(subscribers);
  if (!subscribers || subscribers.length === 0) {
    throw new ApiError(404, "No subscribers found for this channel");
  }

  return res
    .status(200)
    .json(
      new ApiResponse(200, subscribers, "Subscribers fetched successfully")
    );
});

// controller to return channel list to which user has subscribed
const getSubscribedChannels = asyncHandler(async (req, res) => {
  const { subscriberId } = req.params;

  if (!subscriberId) {
    throw new ApiError(400, "Bad Request: Subsciber Id is required");
  }

  const channels = await Subscription.find({ subscriber: subscriberId });

  if (!channels) {
    throw new ApiError(400, "User has not subscribed to any other channels");
  }
  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        channels,
        "Channels subscribed by user have been fetched"
      )
    );
});

export { toggleSubscription, getUserChannelSubscribers, getSubscribedChannels };
