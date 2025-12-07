import express from "express";
import { signUp } from "../controllers/auth.controllers.js";
import { signIn } from "../controllers/auth.controllers.js";
import { signOut } from "../controllers/auth.controllers.js";

const authRouter = express.Router();

authRouter.post("/signup",signUp)
authRouter.post("/signin",signIn)
authRouter.post("/signout",signOut)

export default authRouter;