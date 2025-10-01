import { Router } from "express"
import {
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
} from "../controllers/user.controller.js"
import { is_authenticated } from "../middlewares/is_authenticated.js"
import multer from "multer"

const router = Router()
const upload = multer()

router.use(is_authenticated)
router.get("/me", get_current_user)
router.get("/suggested", get_suggested_users)
router.get("/search", search_users)
router.get("/is-following/:identifier", is_following)
router.get("/:identifier", get_profile)
router.get("/:identifier/followers", get_user_followers)
router.get("/:identifier/following", get_user_following)

router.post("/toggle-follow/:identifier", toggle_follow_user)
router.post("/block/:identifier", block_user)
router.post("/unblock/:identifier", unblock_user)
router.post("/profile/edit", upload.single("image"), edit_profile)

export default router
