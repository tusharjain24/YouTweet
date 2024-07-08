import { Tweet } from "../models/tweet.model.js";
import { ApiError } from "../utils/ApiError.util.js";
import { ApiResponse } from "../utils/ApiResponse.util.js";
import { asyncHandler } from "../utils/asyncHandler.util.js";

const createTweet = asyncHandler(async (req, res) => {
  //TODO: create tweet
  const { tweetContent } = req.body;
  const userId = req.user?._id;

  if (!userId) {
    throw new ApiError(400, "Unauthorised Request");
  }

  if (!tweetContent || tweetContent.trim() == "") {
    throw new ApiError(400, "Tweet is empty.");
  }

  const tweet = await Tweet.create({
    content: tweetContent,
    owner: userId,
  });

  if (!tweet) {
    throw new ApiError(400, "Something went wrong in creating tweet ");
  }

  res
    .status(200)
    .json(
      new ApiResponse(200, tweet, `Tweet has been created for user ${userId}`)
    );
});

const getUserTweets = asyncHandler(async (req, res) => {
  // TODO: get user tweets
  const { userId } = req.params;
  const page = 1;
  const limit = 10;
  if (!userId) {
    throw new ApiError(400, "User not found");
  }

  const tweets = await Tweet.find({ owner: userId })
    .skip((page - 1) * limit)
    .limit(limit);

  if (!tweets || tweets.length === 0) {
    throw new ApiError(
      400,
      "Tweets not found or user has not Tweeted once yet."
    );
  }

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        tweets,
        "All the Tweets of the user has been fetched"
      )
    );
});

const updateTweet = asyncHandler(async (req, res) => {
  //TODO: update tweet
  const { content } = req.body;
  const userId = req.user?._id;
  const { tweetId } = req.params;

  if (!content || content.trim() == "") {
    throw new ApiError(403, "Cannot send empty Tweet");
  }

  if (!userId) {
    throw new ApiError(400, "Unauthorised request");
  }

  if (!tweetId) {
    throw new ApiError(400, "Tweet not found");
  }

  const updatedtweet = await Tweet.findOneAndUpdate(
    { _id: tweetId, owner: userId },
    {
      $set: {
        content: content,
      },
    },
    { new: true }
  );

  if (!updatedtweet) {
    throw new ApiError(
      400,
      "Tweet not found or user doesn't have permission to modify the Tweet"
    );
  }

  return res
    .status(200)
    .json(new ApiResponse(200, updatedtweet, "Tweet has been updated"));
});

const deleteTweet = asyncHandler(async (req, res) => {
  //TODO: delete tweet
  const { tweetId } = req.params;
  if (!tweetId) {
    throw new ApiError(400, "Tweet not found");
  }
  const userId = req.user?._id;
  if (!userId) {
    throw new ApiError(400, "Unauthorized request");
  }
  const deletedTweet = await Tweet.findOneAndDelete({
    _id: tweetId,
    owner: userId,
  });

  if (!deletedTweet) {
    throw new ApiError(
      400,
      "Something went wrong in deleting the Tweet or Tweet does not exist"
    );
  }

  return res
    .status(200)
    .json(
      new ApiResponse(200, deletedTweet, "Tweet has been deleted successfully")
    );
});

export { createTweet, getUserTweets, updateTweet, deleteTweet };
