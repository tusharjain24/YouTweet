import { Router } from "express";
import {
  registerUser,
  loginUser,
  logOutUser,
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
// Router.route("/login").post(userLogin);

userRouter.route("/login").post(loginUser);

// Secured Routes
userRouter.route("/logout").post(verifyJwt, logOutUser);

export default userRouter;
