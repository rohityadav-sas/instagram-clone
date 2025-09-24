import { Router } from "express"
import { is_authenticated } from "../middlewares/is_authenticated.js"
import {
	create_comment,
	delete_comment,
	get_comments,
	toggle_like_comment,
} from "../controllers/comment.controller.js"

const router = Router()

router.post("/create/:post_id", is_authenticated, create_comment)
router.post("/delete/:comment_id", is_authenticated, delete_comment)
router.post("/toggle-like/:comment_id", is_authenticated, toggle_like_comment)
router.get("/get/:post_id", is_authenticated, get_comments)

export default router
