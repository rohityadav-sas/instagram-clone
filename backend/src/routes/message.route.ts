import { Router } from "express"
import { is_authenticated } from "../middlewares/is_authenticated.js"
import {
	get_messages,
	send_message,
} from "../controllers/message.controller.js"

const router = Router()

router.post("/send/:username", is_authenticated, send_message)
router.get("/get-messages/:username", is_authenticated, get_messages)

export default router
