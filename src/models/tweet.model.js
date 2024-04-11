import mongoose from "mongoose";

const tweetSchema = new mongoose.Schema(
  {
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    content: {
      type: String,
      required: [true, "Content is required to tweet"],
    },
  },
  { timestamps: true }
);

export const Tweet = new mongoose.model("Tweet", tweetSchema);
