import express from "express";

import {
registerCitizen
} from "../controllers/citizenController.js";

const router = express.Router();

router.post("/register", registerCitizen);

export default router;