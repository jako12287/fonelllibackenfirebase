import { Router } from "express";
import { login } from "../controller/loginUser.controller";

const router = Router();

router.post("/login", login);

export default router;
