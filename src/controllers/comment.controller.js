import mongoose from "mongoose";
import { Comment } from "../models/comment.model.js";
import { ApiError } from "../utils/ApiError.util.js";
import { ApiResponse } from "../utils/ApiResponse.util.js";
import { asyncHandler } from "../utils/asyncHandler.util.js";

const getVideoComments = asyncHandler(async (req, res) => {
  const { videoId } = req.params;

  if (!videoId) {
    throw new ApiError(400, "Bad Request: Video not found");
  }

  //TODO: add limit to get all comments for a video
  const { page = 1, limit = 10 } = req.query;

  const allComments = await Comment.find({ video: videoId });

  if (!allComments) {
    throw new ApiError(
      400,
      "Something went wrong. Comments could not be fetched!!"
    );
  }

  return res
    .status(200)
    .json(new ApiResponse(200, allComments, "Comments fetched successfully!!"));
});

const addComment = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  const { content } = req.body;
  const userId = req.user?._id;

  if (!userId) {
    throw new ApiError(400, "Unauthorised Request");
  }
  if (!videoId) {
    throw new ApiError(400, "Bad Request");
  }

  // Check if the comment content recieved is not empty
  if (!content || content.trim() === "") {
    throw new ApiError(400, "Invalid data!!");
  }

  const newComment = await Comment.create({
    content: content,
    video: videoId,
    owner: userId,
  });

  if (!newComment) {
    throw new ApiError(
      400,
      "Something went wrong. Comment could not be added!!"
    );
  }

  return res
    .status(200)
    .json(new ApiResponse(200, newComment, "Comment added successfully!!"));
});

const updateComment = asyncHandler(async (req, res) => {
  // Get data from the browser(frontend)
  const { commentId } = req.params;
  const { content } = req.body;
  const userId = req.user?._id;

  if (!userId) {
    throw new ApiError(400, "Unauthorised Request");
  }
  if (!commentId) {
    throw new ApiError(400, "Bad Request");
  }

  // Check if the comment content recieved is not empty
  if (!content || content.trim() === "") {
    throw new ApiError(400, "Invalid data!!");
  }

  const updatedComment = await Comment.findOneAndUpdate(
    { _id: commentId, owner: userId },
    {
      $set: {
        content: content,
      },
    },
    {
      new: true,
    }
  );

  if (!updatedComment) {
    throw new ApiError(
      400,
      "You are unauthorized or Something went wrong. Comment not updated!!"
    );
  }

  return res
    .status(200)
    .json(
      new ApiResponse(200, updatedComment, "Comment updated successfully!!")
    );
});

const deleteComment = asyncHandler(async (req, res) => {
  // Get data from the browser(frontend)
  const { commentId } = req.params;
  const userId = req.user?._id;

  if (!userId) {
    throw new ApiError(400, "Unauthorised Request");
  }
  if (!commentId) {
    throw new ApiError(400, "Bad Request");
  }

  const deletedComment = await Comment.deleteOne({
    _id: commentId,
    owner: userId,
  });

  // console.log(deletedComment);

  if (!deletedComment) {
    throw new ApiError(
      400,
      "You are not the owner or error while deleting the comment"
    );
  }
  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        deletedComment,
        "Comment has been deleted successfully!!"
      )
    );
});

export { getVideoComments, addComment, updateComment, deleteComment };
