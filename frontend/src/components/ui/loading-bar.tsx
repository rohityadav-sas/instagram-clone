"use client"
import { useEffect, useState } from "react"
import { create } from "zustand"

// Global store for loading state
interface LoadingStore {
	isLoading: boolean
	startLoading: () => void
	stopLoading: () => void
}

export const useLoadingStore = create<LoadingStore>((set) => ({
	isLoading: false,
	startLoading: () => set({ isLoading: true }),
	stopLoading: () => set({ isLoading: false }),
}))

const LoadingBar = () => {
	const { isLoading } = useLoadingStore()
	const [progress, setProgress] = useState(0)
	const [visible, setVisible] = useState(false)

	useEffect(() => {
		let progressInterval: NodeJS.Timeout
		let hideTimeout: NodeJS.Timeout

		if (isLoading) {
			setVisible(true)
			setProgress(10)

			progressInterval = setInterval(() => {
				setProgress((prev) => {
					if (prev >= 90) return prev
					return prev + Math.random() * 10
				})
			}, 150)
		} else {
			setProgress(100)
			hideTimeout = setTimeout(() => {
				setVisible(false)
				setProgress(0)
			}, 300)
		}

		return () => {
			if (progressInterval) clearInterval(progressInterval)
			if (hideTimeout) clearTimeout(hideTimeout)
		}
	}, [isLoading])

	if (!visible) return null

	return (
		<div className="fixed top-0 left-0 right-0 z-[9999] h-0.5 bg-gray-200">
			<div
				className="h-full bg-pink-400 transition-all duration-200 ease-out"
				style={{
					width: `${progress}%`,
				}}
			/>
		</div>
	)
}

export default LoadingBar
