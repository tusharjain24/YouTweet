import { Router } from "express";
import {
  addComment,
  deleteComment,
  getVideoComments,
  updateComment,
} from "../controllers/comment.controller.js";

import { verifyJwt } from "../middleware/auth.middleware.js";

const router = Router();

router.use(verifyJwt); // Apply verifyJwt middleware to all routes in this file

router.route("/:videoId").get(getVideoComments).post(addComment);
router.route("/channel/:commentId").delete(deleteComment).patch(updateComment);
router.route("/:videoId/add-comment").post(addComment);

export default router;
