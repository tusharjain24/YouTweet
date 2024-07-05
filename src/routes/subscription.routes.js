import { Router } from "express";
import {
  getSubscribedChannels,
  getUserChannelSubscribers,
  toggleSubscription,
} from "../controllers/subscription.controller.js";
import { verifyJwt } from "../middleware/auth.middleware.js";

const router = Router();
router.use(verifyJwt); // Apply verifyJwt middleware to all routes in this file

router
  .route("/channel/:subscriberId")
  .get(getSubscribedChannels)
  .post(toggleSubscription);

router.route("/user/:channelId").get(getUserChannelSubscribers);

export default router;
