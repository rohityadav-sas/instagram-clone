import { Router } from "express"
import { is_authenticated } from "../middlewares/is_authenticated.js"
import {
	get_messages,
	send_message,
} from "../controllers/message.controller.js"

const router = Router()
router.use(is_authenticated)

router.post("/send/:username", send_message)
router.get("/get-messages/:username", get_messages)

export default router
