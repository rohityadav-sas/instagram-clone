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

// Create a new story
router.post("/", is_authenticated, upload.single("image"), createStory)

// Get all stories (feed)
router.get("/", is_authenticated, getStories)

// Get user's own stories
router.get("/user/:userId", is_authenticated, getUserStories)

// Get specific story by ID
router.get("/:id", is_authenticated, getStoryById)

// Add viewer to story
router.post("/:id/view", is_authenticated, addStoryViewer)

// Delete story
router.delete("/:id", is_authenticated, deleteStory)

export default router
