import mongoose, { isValidObjectId } from "mongoose";
import { Playlist } from "../models/playlist.model.js";
import { ApiError } from "../utils/ApiError.util.js";
import { ApiResponse } from "../utils/ApiResponse.util.js";
import { asyncHandler } from "../utils/asyncHandler.util.js";

const createPlaylist = asyncHandler(async (req, res) => {
  //TODO: create playlist
  const { name, description } = req.body;
  const userId = req.user?._id;
  console.log(name, description);
  if (!name || !description || name.trim() == "" || description.trim() == "") {
    throw new ApiError(400, "Name and Description are required");
  }

  const createdPlaylist = await Playlist.create({
    name: name,
    description: description,
    owner: userId,
  });

  if (!createdPlaylist) {
    throw new ApiError(400, "Something went wrong While creating a playlist");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, createdPlaylist, "Playlist has been created"));
});

const getUserPlaylists = asyncHandler(async (req, res) => {
  //TODO: get user playlists
  const { userId } = req.params;

  if (!userId) {
    throw new ApiError(404, "User not found");
  }

  const userPlaylists = await Playlist.find({ owner: userId });

  if (!userPlaylists) {
    throw new ApiError(400, "Playlists not found");
  }

  return res
    .status(200)
    .json(
      new ApiResponse(200, userPlaylists, "User's Playlists have been fetched")
    );
});

const getPlaylistById = asyncHandler(async (req, res) => {
  //TODO: get playlist by id
  const { playlistId } = req.params;

  if (!playlistId) {
    throw new ApiError(400, "Playlist Id not found");
  }

  const fetchedPlaylist = await Playlist.findOne({ _id: playlistId });

  if (!fetchedPlaylist) {
    throw new ApiError(400, "Playlist not found in the database");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, fetchedPlaylist, "Playlist has been fetched"));
});

const addVideoToPlaylist = asyncHandler(async (req, res) => {
  const { playlistId, videoId } = req.params;
  const userId = req.user?._id;
  if (!playlistId) {
    throw new ApiError(404, "Playlist ID not found");
  }

  if (!videoId) {
    throw new ApiError(404, "Video Id not found");
  }
  const updatedPlaylist = await Playlist.findOne({
    _id: playlistId,
    owner: userId,
  });

  updatedPlaylist.videos.push(videoId);

  await updatedPlaylist.save({ validateBeforeSave: false });
  if (!updatedPlaylist) {
    throw new ApiError(
      404,
      "Playlist not found or you do not have permission to modify this playlist"
    );
  }
  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        updatedPlaylist,
        "Video has been added to the playlist"
      )
    );
});

const removeVideoFromPlaylist = asyncHandler(async (req, res) => {
  const { playlistId, videoId } = req.params;

  if (!playlistId) {
    throw new ApiError(404, "Playlist ID not found");
  }

  if (!videoId) {
    throw new ApiError(404, "Video Id not found");
  }

  const userId = req.user?._id;
  if (!userId) {
    throw new ApiError(400, "Unauthorized request");
  }

  const playlist = await Playlist.findOneAndUpdate(
    { _id: playlistId, owner: userId },
    { $pull: { videos: videoId } },
    { new: true }
  );

  if (!playlist) {
    throw new ApiError(
      404,
      "Video not found or you do not have permission to modify this playlist"
    );
  }

  return res.status(200).json({
    message: "Video removed from playlist",
    playlist,
  });
});

const deletePlaylist = asyncHandler(async (req, res) => {
  // TODO: delete playlist
  const { playlistId } = req.params;

  const userId = req.user?._id;

  if (!playlistId) {
    throw new ApiError(400, "Cannot find playlist");
  }

  if (!userId) {
    throw new ApiError(400, "Unauthorized Request");
  }

  const deletedPlaylist = await Playlist.deleteOne({
    _id: playlistId,
    owner: userId,
  });

  if (!deletedPlaylist) {
    throw new ApiError(
      404,
      "Playlist not found or you do not have permission to delete this playlist"
    );
  }
  return res
    .status(200)
    .json(new ApiResponse(200, deletedPlaylist, "Playlist has been deleted"));
});

const updatePlaylist = asyncHandler(async (req, res) => {
  //TODO: update playlist
  const { playlistId } = req.params;
  const { name, description } = req.body;
  if (!playlistId) {
    throw new ApiError(400, "Cannot find playlist");
  }
  if (!name || name.trim() == "" || !description || description.trim() == "") {
    throw new ApiError(400, "Name and description are required");
  }
  const updatedPlaylist = await Playlist.findByIdAndUpdate(
    { _id: playlistId },
    {
      $set: {
        name: name,
        description: description,
      },
    },
    { new: true }
  );

  if (!updatedPlaylist) {
    throw new ApiError(400, "Something went wrong while updating the playlist");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, updatedPlaylist, "Playlist has been updated"));
});

export {
  createPlaylist,
  getUserPlaylists,
  getPlaylistById,
  addVideoToPlaylist,
  removeVideoFromPlaylist,
  deletePlaylist,
  updatePlaylist,
};
