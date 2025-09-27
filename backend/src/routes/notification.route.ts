import { Router } from "express"
import { is_authenticated } from "../middlewares/is_authenticated.js"
import {
	getNotifications,
	markAsRead,
	markAllAsRead,
	getUnreadCount,
} from "../controllers/notification.controller.js"

const router = Router()
router.use(is_authenticated)

router.get("/all", getNotifications)
router.get("/unread-count", getUnreadCount)

router.post("/:id/read", markAsRead)
router.post("/read-all", markAllAsRead)

export default router
