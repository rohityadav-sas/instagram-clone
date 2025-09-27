import { Router } from "express"
import { is_authenticated } from "../middlewares/is_authenticated.js"
import {
	create_comment,
	delete_comment,
	get_comments,
} from "../controllers/comment.controller.js"

const router = Router()
router.use(is_authenticated)

router.post("/create/:post_id", create_comment)
router.post("/delete/:comment_id", delete_comment)
router.get("/get/:post_id", get_comments)

export default router
