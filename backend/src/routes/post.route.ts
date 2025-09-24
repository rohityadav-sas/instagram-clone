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

router.post("/create", is_authenticated, upload.single("image"), create_post)
router.post("/delete/:post_id", is_authenticated, delete_post)
router.post("/toggle-like/:post_id", is_authenticated, toggle_like_post)
router.post("/toggle-bookmark/:post_id", is_authenticated, toggle_bookmark_post)

router.get("/feed", is_authenticated, get_feed_posts)
router.get("/explore", is_authenticated, get_explore_posts)
router.get("/search", is_authenticated, search_posts)
router.get("/bookmarks", is_authenticated, get_bookmarked_posts)
router.get("/:post_id/likes", is_authenticated, get_post_likes)
router.get("/:username", is_authenticated, get_user_posts)

export default router
