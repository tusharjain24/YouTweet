import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import { expressLimit } from "./constants.js";
import { rateLimit } from "express-rate-limit";

const app = express();

const limit = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  message: "Rate Limit Exceeded. Please try again in 15 minutes",
});

app.use(limit);
// app.use is generally used for middlewares and configurations(to connect Frontend)
app.use(
  cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true,
  })
);

app.use(express.json({ limit: expressLimit }));
app.use(express.urlencoded({ extended: true, limit: expressLimit }));
app.use(express.static("public"));
app.use(cookieParser());

// Routes import
import { healthCheckRouter } from "./routes/healthcheck.routes.js";
import { userRouter } from "./routes/user.routes.js";
import tweetRouter from "./routes/tweet.routes.js";
import subscriptionRouter from "./routes/subscription.routes.js";
import videoRouter from "./routes/video.routes.js";
import commentRouter from "./routes/comment.routes.js";
import likeRouter from "./routes/like.routes.js";
import playlistRouter from "./routes/playlist.routes.js";
import dashboardRouter from "./routes/dashboard.routes.js";

// routes declaration
app.use("/api/v1/healthcheck", healthCheckRouter);
app.use("/api/v1/users", userRouter);
// Exapmle of route : http://localhost:8000/api/v1/users/register
app.use("/api/v1/tweets", tweetRouter);
app.use("/api/v1/subscriptions", subscriptionRouter);
app.use("/api/v1/videos", videoRouter);
app.use("/api/v1/comments", commentRouter);
app.use("/api/v1/likes", likeRouter);
app.use("/api/v1/playlist", playlistRouter);
app.use("/api/v1/dashboard", dashboardRouter);
export { app };

// app.get,app.post,app.use; (err, req, res, next)
// next is a flag which tells us whether it has passed a middleware or not
