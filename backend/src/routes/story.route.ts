import { Router } from "express"
import {
	createStory,
	getStories,
	getStoryById,
	deleteStory,
	addStoryViewer,
	getUserStories,
} from "../controllers/story.controller.js"
import { is_authenticated } from "../middlewares/is_authenticated.js"
import multer from "multer"

const upload = multer()
const router = Router()
router.use(is_authenticated)

router.get("/", getStories)
router.get("/user/:userId", getUserStories)
router.get("/:id", getStoryById)

router.post("/", upload.single("image"), createStory)
router.post("/:id/view", addStoryViewer)

router.delete("/:id", deleteStory)

export default router
