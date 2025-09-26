import { Router } from "express"
import { is_authenticated } from "../middlewares/is_authenticated.js"
import multer from "multer"
import {
	create_post,
	delete_post,
	get_explore_posts,
	get_feed_posts,
	get_post_likes,
	toggle_bookmark_post,
	toggle_like_post,
	search_posts,
	get_bookmarked_posts,
} from "../controllers/post.controller.js"
import { get_user_posts } from "../controllers/post.controller.js"

const upload = multer()
const router = Router()
router.use(is_authenticated)

router.post("/create", upload.single("image"), create_post)
router.post("/delete/:post_id", delete_post)
router.post("/toggle-like/:post_id", toggle_like_post)
router.post("/toggle-bookmark/:post_id", toggle_bookmark_post)

router.get("/feed", get_feed_posts)
router.get("/explore", get_explore_posts)
router.get("/search", search_posts)
router.get("/bookmarks", get_bookmarked_posts)
router.get("/:post_id/likes", get_post_likes)
router.get("/:username", get_user_posts)

export default router
