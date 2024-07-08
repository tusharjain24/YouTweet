import { Comment } from "../models/comment.model.js";
import { Video } from "../models/video.model.js";
import { ApiError } from "../utils/ApiError.util.js";
import { ApiResponse } from "../utils/ApiResponse.util.js";
import { asyncHandler } from "../utils/asyncHandler.util.js";
import {
  uploadOnCloudinary,
  deleteOldMedia,
} from "../utils/cloudinary.util.js";

const getAllVideos = asyncHandler(async (req, res) => {
  //TODO: get all videos based on query, sort, pagination
  const { page = 1, limit = 10, query, sortBy, sortType, userId } = req.query;
  const validSortFields = ["createdAt", "title"];
  const validSortTypes = ["asc", "desc"];

  if (sortBy && !validSortFields.includes(sortBy)) {
    throw new ApiError(400, "Invalid Sort Field");
  }

  if (sortType && !validSortTypes.includes(sortType)) {
    throw new ApiError(400, "Invalid Sort Type");
  }

  // Build the query filter
  let filter = {};
  if (userId) {
    filter = { owner: userId };
  }

  if (query) {
    filter.title = { $regex: query, $options: "i" }; // Case-insensitive regex search on title
  }

  const sort = {};
  if (sortBy) {
    sort[sortBy] = sortType === "desc" ? -1 : 1;
  }

  const fetchedVideos = await Video.find(filter)
    .sort(sort)
    .skip((page - 1) * limit)
    .limit(limit);

  if (!fetchedVideos || fetchedVideos.length === 0) {
    throw new ApiError(
      400,
      "Videos Not Found Or Something went wrong while Fetching the Videos from the Database"
    );
  }

  return res
    .status(200)
    .json(new ApiResponse(200, fetchedVideos, "Videos have been fetched"));
});

const publishAVideo = asyncHandler(async (req, res) => {
  // TODO: get video, upload to cloudinary, create video
  const { title, description, shouldPublish } = req.body;
  if ([title, description].some((field) => field?.trim() === "")) {
    throw new ApiError(400, "All fields are required");
  }

  // console.log(req.files);
  const videoLocalPath = req.files?.videoFile[0]?.path;
  const thumbnailLocalPath = req.files?.thumbnail[0]?.path;

  if (!req.user._id) {
    throw new ApiError(401, "user not found");
  }
  if (!videoLocalPath) {
    throw new ApiError(400, "Video file is required");
  }
  if (!thumbnailLocalPath) {
    throw new ApiError(400, "Thumbnail file is required");
  }

  const [videoPath, thumbnailPath] = await Promise.all([
    uploadOnCloudinary(videoLocalPath),
    uploadOnCloudinary(thumbnailLocalPath),
  ]);

  if (!videoPath || !thumbnailPath) {
    let errorMessage = "";
    if (!videoFile) errorMessage += "Failed to upload video. ";
    if (!thumbnailFile) errorMessage += "Failed to upload thumbnail.";
    throw new ApiError(500, errorMessage);
  }

  // console.log("VideoPath: ", videoPath);
  // console.log("thumbnailPath: ",thumbnailPath);

  const videoDuration = videoPath.duration;
  // console.log(videoDuration);
  // console.log("Video URL: ", videoPath.url);

  const videoCreated = await Video.create({
    videoFile: videoPath.url,
    thumbnail: thumbnailPath.url,
    title: title,
    description: description,
    duration: videoDuration,
    views: 0,
    isPublished: shouldPublish,
    owner: req.user._id,
  });

  if (!videoCreated) {
    throw new ApiError(400, "Failed to upload the video to the database");
  }

  return res
    .status(201)
    .json(new ApiResponse(201, videoCreated, "Video published successfully"));
});

const getVideoById = asyncHandler(async (req, res) => {
  //TODO: get video by id
  const { videoId } = req.params;
  const user = req.user;
  // console.log(user);
  if (!videoId) {
    throw new ApiError(403, "Video not found");
  }
  const fetchedVideo = await Video.findById({ _id: videoId });
  if (!fetchedVideo) {
    throw new ApiError(400, "Bad Request: Video not found");
  }

  if (!fetchedVideo.isPublished) {
    throw new ApiError(400, "Video not found(is not published yet)");
  }

  fetchedVideo.views += 1;
  await fetchedVideo.save({ validateBeforSave: false });
  if (!user.watchHistory.includes(videoId)) {
    user.watchHistory.push(videoId);
    await user.save({ validateBeforeSave: false });
  }

  return res
    .status(200)
    .json(new ApiResponse(200, fetchedVideo, "Video has been fetched"));
});

const updateVideo = asyncHandler(async (req, res) => {
  //TODO: update video details like title, description, thumbnail
  const { videoId } = req.params;
  const thumbnailLocalPath = req.file?.path;
  const userId = req.user?._id;
  const { title, description } = req.body;

  if ([title, description].some((field) => field?.trim() === " ")) {
    throw new ApiError(400, "All fields are required");
  }

  if (!thumbnailLocalPath) {
    throw new ApiError(400, "Thumbnail File is required");
  }

  const thumbnailPath = uploadOnCloudinary(thumbnailLocalPath);

  if (!thumbnailPath) {
    throw new ApiError(
      400,
      "Error while uploading the thumbnail to Cloudinary "
    );
  }
  const video = await Video.findOne({ _id: videoId, owner: userId });
  deleteOldMedia(video.thumbnail);
  const updatedVideo = await Video.findOneAndUpdate(
    { _id: videoId, owner: userId },
    {
      $set: {
        title: title,
        description: description,
        thumbnail: thumbnailPath.url,
      },
    },
    { new: true }
  );

  if (!updatedVideo) {
    throw new ApiError(
      400,
      "Bad Request: Video not found or User cannot modify the video"
    );
  }

  return res
    .status(200)
    .json(
      new ApiResponse(200, updatedVideo, "Video Details have been updated")
    );
});

const deleteVideo = asyncHandler(async (req, res) => {
  //TODO: delete video
  const { videoId } = req.params;
  const userId = req.user?._id;
  if (!userId) {
    throw new ApiError(400, "Unauthorised Request");
  }
  if (!videoId) {
    throw new ApiError(400, "Bad Request");
  }

  const video = await Video.findOne({ _id: videoId, owner: userId });
  deleteOldMedia(video.thumbnail);
  deleteOldMedia(video.videoFile);
  const commentsOnVideo = await Comment.deleteMany({ video: videoId });
  if (!commentsOnVideo) {
    console.log("No Comments on the video");
  } else {
    console.log("Comments have been deleted");
  }

  const videoDeleted = await Video.deleteOne({ _id: videoId, owner: userId });

  if (!videoDeleted) {
    throw new ApiError(
      400,
      "Bad Request: Video not found or User cannot modify the video"
    );
  }

  return res
    .status(200)
    .json(
      new ApiResponse(200, videoDeleted, "Video has been successfully deleted")
    );
});

const togglePublishStatus = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  const userId = req.user?._id;
  // console.log(req.user);
  const video = await Video.findOne({ _id: videoId, owner: userId });
  if (!video) {
    throw new ApiError(
      400,
      "Bad Request: Video not found or User cannot modify the video"
    );
  }

  if (video.isPublished) {
    video.isPublished = false;
  } else {
    video.isPublished = true;
  }
  await video.save({ validateBeforSave: false });

  return res
    .status(200)
    .json(new ApiResponse(200, video, "video status has been toggled"));
});

export {
  getAllVideos,
  publishAVideo,
  getVideoById,
  updateVideo,
  deleteVideo,
  togglePublishStatus,
};
