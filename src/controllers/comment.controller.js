// import { cloudinary } from "../utils/cloudinary.util.js";
// import { multer } from "../middleware/multer.middleware.js";
// import { asyncHandler } from "../utils/asyncHandler.util.js";

// const channelRoute = Router();
// Upload a video
// Delete a video
// Archive a video
// Home
// Playlist
// Videos
// Channel Url creation
// Filter options


import { asyncHandler } from "../utils/asyncHandler.util.js";
import { ApiError } from "../utils/ApiError.util.js";
import { Comment } from "../models/comment.model.js";
import { ApiResponse } from "../utils/ApiResponse.util.js";

const addComment = asyncHandler(async (req, res) => {

  // Get data from the browser(frontend)
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

export { addComment };