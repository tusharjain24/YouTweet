import mongoose, { isValidObjectId } from "mongoose";
import { Video } from "../models/video.model.js";
import { User } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.util.js";
import { ApiResponse } from "../utils/ApiResponse.util.js";
import { asyncHandler } from "../utils/asyncHandler.util.js";
import { uploadOnCloudinary } from "../utils/cloudinary.util.js";

const getAllVideos = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, query, sortBy, sortType, userId } = req.query;
  //TODO: get all videos based on query, sort, pagination
});

const publishAVideo = asyncHandler(async (req, res) => {
  // TODO: get video, upload to cloudinary, create video
  const { title, description } = req.body;
  const user = req.user;
  // const video = req.file?.video;
  // const thumbnail = req.file?.thumbnail;
  let videoFile;
  if (
    req.files &&
    Array.isArray(req.files.video) &&
    req.files.video.length > 0
  ) {
    videoFile = req.files.video[0].path;
  }

  let thumbnail;
  if (
    req.files &&
    Array.isArray(req.files.thumbnail) &&
    req.files.thumbnail.length > 0
  ) {
    thumbnail = req.files.thumbnail[0].path;
  }

  if (!user) return res.status(401).json(new apiError(401, "user not found"));
  if ([title, description].some((field) => field?.trim() === "")) {
    return res.status(400).json(new apiError(400, "All fields are required"));
  }

  if (!videoFile || !thumbnail) {
    return res
      .status(400)
      .json({ message: "Both video file and thumbnail are required" });
  }
});

const getVideoById = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  // checking if i am getting video's correct Id
  // find the video from the database using the given Id
  // send the video as a response
  //TODO: get video by id
});

const updateVideo = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  //TODO: update video details like title, description, thumbnail
});

const deleteVideo = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  //TODO: delete video
});

const togglePublishStatus = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
});

export {
  getAllVideos,
  publishAVideo,
  getVideoById,
  updateVideo,
  deleteVideo,
  togglePublishStatus,
};
