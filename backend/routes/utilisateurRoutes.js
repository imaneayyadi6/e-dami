import express from "express";
import {
  authUser,
  getChefServices,
  getDirecteurs,
  createUser,
  getUserByID,
  getUsers,
  updateUserInfo,
  updateUserPassword,
  deleteUser,
} from "../controllers/utilisateurController.js";
import { createur, protect } from "../middlewares/authMidlleware.js";

const router = express.Router();

router.route("/login").post(authUser);
router.route("/directeurs").get(protect, createur, getDirecteurs);
router.route("/chefdeservices").get(protect, createur, getChefServices);

router
  .route("/")
  .get(protect, createur, getUsers)
  .post(protect, createur, createUser);

router
  .route("/:id")
  .get(protect, getUserByID)
  .delete(protect, createur, deleteUser);

router.route("/infos/:id").put(protect, createur, updateUserInfo);
router.route("/password/:id").put(protect, createur, updateUserPassword);

export default router;
