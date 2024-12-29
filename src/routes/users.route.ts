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

const upload = multer({
  storage: multer.memoryStorage(),
});

const router = Router();

router.get("/getAllUser", getAllUsers);
router.get("/getUserById/:_id", getUserById);
router.post("/register", resgisterUser);
router.post("/registerMasseve", upload.single("file"), registerMassiveUsers);
router.put("/changePassword", changepassword);
router.put("/changeUser", changeDataUser);
router.delete("/deleteUser", deleteUser);
router.post("/verifyPassword", verifyPassword);

export default router;
