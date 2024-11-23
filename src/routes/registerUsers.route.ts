import { Router } from "express";
import { ResgisterUser } from "../controller/registerUsers.controlller";

const router = Router();

router.post("/register", ResgisterUser);

export default router;
