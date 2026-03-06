import express from "express";
import {
  addToWishlist,
  removeFromWishlist,
  getWishlist,
} from "../controllers/wishlistController.js";
import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/add", authMiddleware, addToWishlist);
router.post("/remove", authMiddleware, removeFromWishlist);
router.post("/get", authMiddleware, getWishlist);

export default router;
