import { Router } from "express";
import { addComment } from "../controllers/comment.controller";

const commentRouter = Router();

commentRouter.route("/add-comment").post(addComment);