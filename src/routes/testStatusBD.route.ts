import { Router } from "express";
import { testStatus } from "../controller/testStatus.controller";

const router = Router();

router.get("/testbd", testStatus);

export default router;
