import { Router } from "express";
import { wellcome } from "../controller/wellcome.controler";

const router = Router();

router.get("/", wellcome);


export default router;