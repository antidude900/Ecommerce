import express from "express";
import {
	createUser,
	loginUser,
	logoutUser,
	getAllUsers,
	getUser,
	updateUser,
	deleteUserById,
	getUserById,
	updateUserById,
} from "../controllers/userController.js";
import { authenticate, authorizeAdmin } from "../middlewares/authMiddleware.js";

const router = express.Router();

router
	.route("/")
	.post(createUser)
	.get(authenticate, authorizeAdmin, getAllUsers);

router.post("/login", loginUser);
router.post("/logout", logoutUser);

router
	.route("/profile")
	.get(authenticate, getUser)
	.put(authenticate, updateUser);

router
	.route("/:id")
	.delete(authenticate, authorizeAdmin, deleteUserById)
	.get(getUserById)
	.put(updateUserById);

export default router;
