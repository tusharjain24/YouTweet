import mongoose from "mongoose";
import { Comment } from "../models/comment.model.js";
import { ApiError } from "../utils/ApiError.util.js";
import { ApiResponse } from "../utils/ApiResponse.util.js";
import { asyncHandler } from "../utils/asyncHandler.util.js";

const getVideoComments = asyncHandler(async (req, res) => {
  //TODO: get all comments for a video
  const { videoId } = req.params;
  const { page = 1, limit = 10 } = req.query;
});

const addComment = asyncHandler(async (req, res) => {
  // TODO: add a comment to a video
  // Get data from the browser(frontend)
  const { videoId } = req.params;
  const { content, video, owner } = req.body;

  // Check if the user is logged in
  if (!owner) {
    throw new ApiError(400, "Please login to comment!!");
  }
  // Check if the comment content recieved is not empty and the video is valid
  if (!content || content.trim() === "" || !video) {
    throw new ApiError(400, "Invalid data!!");
  }

  await Comment.findOneAndUpdate(
    {
      owner: owner,
      video: video
    }, {
    $set: { content: content }
  }, {
    upsert: true
  },
    function (err, result) {
      if (err) {
        throw new ApiError(400, err.errmsg);
      }
      return res
        .status(200)
        .json(
          new ApiResponse(200, channel[0], "Comment added successfully!!")
        );
    });
});

const updateComment = asyncHandler(async (req, res) => {
  // TODO: update a comment
});

const deleteComment = asyncHandler(async (req, res) => {
  // TODO: delete a comment
});

export { getVideoComments, addComment, updateComment, deleteComment };