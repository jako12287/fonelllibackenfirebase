import { Router } from "express";
import {
  resgisterUser,
  changepassword,
  getAllUsers,
  changeDataUser,
  deleteUser,
  registerMassiveUsers,
  getUserById,
  verifyPassword,
} from "../controller/registerUsers.controlller";
import multer from "multer";
import { authenticateToken } from "../middlewares/authMiddlewware";

const upload = multer({
  storage: multer.memoryStorage(),
});

const router = Router();

router.get("/getAllUser", authenticateToken, getAllUsers);
router.get("/getUserById/:_id", getUserById);
router.post("/register", authenticateToken, resgisterUser);
router.post(
  "/registerMasseve",
  authenticateToken,
  upload.single("file"),
  registerMassiveUsers
);
router.put("/changePassword", changepassword);
router.put("/changeUser", changeDataUser);
router.delete("/deleteUser", authenticateToken, deleteUser);
router.post("/verifyPassword", verifyPassword);

export default router;
