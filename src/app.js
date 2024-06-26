import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import { expressLimit } from "./constants.js";

const app = express();

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
import { userRouter } from "./routes/user.routes.js";
import { healthCheckRouter } from "./routes/healthcheck.routes.js";

// routes declaration
app.use("/api/v1/users", userRouter);
// Exapmle of route : http://localhost:8000/api/v1/users/register
app.use("/api/v1/healthcheck", healthCheckRouter);
export { app };

// app.get,app.post,app.use; (err, req, res, next)
// next is a flag which tells us whether it has passed a middleware or not
