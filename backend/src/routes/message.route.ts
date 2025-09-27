import { Router } from "express"
import { is_authenticated } from "../middlewares/is_authenticated.js"
import {
	get_messages,
	get_last_messages,
} from "../controllers/message.controller.js"

const router = Router()
router.use(is_authenticated)

router.get("/last", get_last_messages)
router.get("/:identifier", get_messages)

export default router
