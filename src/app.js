import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

const app = express();

// app.use is generally used for middlewares and configurations(to connect Frontend)
app.use(
  cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true,
  })
);

app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ extended: true, limit: "16kb" }));
app.use(express.static("public"));
export { app };

// app.get,app.post,app.use; (err, req, res, next)
// next is a flag which tells us whether it has passed a middleware or not
