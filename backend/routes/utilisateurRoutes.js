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
  validateTokenUser,
  registerUser,
  setPasswordUser,
  changePasswordUser,
  setNewPasswordUser,
} from "../controllers/utilisateurController.js";
import { createur, protect } from "../middlewares/authMidlleware.js";

const router = express.Router();

router.route("/login").post(authUser);
router.route("/validatetoken").post(validateTokenUser);

router.route("/register").post(registerUser);
router.route("/setpassword").post(setPasswordUser);

router.route("/changepassword").post(changePasswordUser);
router.route("/new/setpassword").post(setNewPasswordUser);

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
router.route("/password/:id").put(protect, updateUserPassword);

export default router;
