import { Router } from "express"
import {
	register_user,
	login_user,
	logout_user,
	get_profile,
	get_current_user,
	edit_profile,
	toggle_follow_user,
	get_suggested_users,
	search_users,
	block_user,
	unblock_user,
	get_user_followers,
	get_user_following,
	is_following,
	delete_account,
} from "../controllers/user.controller.js"
import { is_authenticated } from "../middlewares/is_authenticated.js"
import multer from "multer"

const router = Router()
const upload = multer()

// Public routes
router.post("/register", register_user)
router.post("/login", login_user)

// Protected routes
router.get("/me", is_authenticated, get_current_user)
router.get("/logout", logout_user)
router.get("/suggested", is_authenticated, get_suggested_users)
router.get("/search", is_authenticated, search_users)
router.get("/is-following/:identifier", is_authenticated, is_following)
router.get("/:identifier", is_authenticated, get_profile)
router.get("/:identifier/followers", is_authenticated, get_user_followers)
router.get("/:identifier/following", is_authenticated, get_user_following)

router.post("/toggle-follow/:identifier", is_authenticated, toggle_follow_user)
router.post("/block/:identifier", is_authenticated, block_user)
router.post("/unblock/:identifier", is_authenticated, unblock_user)
router.post(
	"/profile/edit",
	is_authenticated,
	upload.single("profile_picture"),
	edit_profile
)

router.delete("/delete", is_authenticated, delete_account)

export default router
