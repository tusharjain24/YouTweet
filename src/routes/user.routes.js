import { Router } from "express";
import {
  registerUser,
  loginUser,
  logOutUser,
  refreshAccessToken,
  changeCurrentPassword,
  getCurrentUser,
  updateAccountDetails,
  updateAvatar,
  updateCoverImage,
  getUserChannelProfile,
  getUserWatchHistory,
} from "../controllers/user.controller.js";
import { upload } from "../middleware/multer.middleware.js";
import { verifyJwt } from "../middleware/auth.middleware.js";
const userRouter = Router();

userRouter.route("/register").post(
  upload.fields([
    {
      name: "avatar",
      maxCount: 1,
    },
    {
      name: "coverImage",
      maxCount: 1,
    },
  ]),
  registerUser
);
userRouter.route("/login").post(loginUser);

// Secured Routes
userRouter.route("/logout").post(verifyJwt, logOutUser);
userRouter.route("/refresh-token").post(refreshAccessToken);
userRouter.route("/change-password").patch(verifyJwt, changeCurrentPassword);
userRouter.route("/current-user").get(verifyJwt, getCurrentUser);
userRouter
  .route("/update-account-details")
  .patch(verifyJwt, updateAccountDetails);
userRouter
  .route("/update-avatar")
  .patch(verifyJwt, upload.single("avatar"), updateAvatar);
userRouter
  .route("/update-cover-Image")
  .patch(verifyJwt, upload.single("coverImage"), updateCoverImage);

userRouter.route("/channel/:username").get(verifyJwt, getUserChannelProfile);

userRouter.route("/user-watch-history").get(verifyJwt, getUserWatchHistory);

export { userRouter };
