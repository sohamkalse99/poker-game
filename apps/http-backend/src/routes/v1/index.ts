import { Router } from "express";
import { userRouter } from "./user";
import { adminRouter } from "./admin";

export const router = Router();

router.use("/user", userRouter);
router.use("/admin", adminRouter);
