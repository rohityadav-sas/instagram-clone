"use client"

import { motion } from "framer-motion"
import { CheckCircle, ArrowRight } from "lucide-react"
import { useEffect } from "react"

export default function AccountDeletionSuccess() {
	useEffect(() => {
		window.history.replaceState({}, "", "/")
	}, [])
	return (
		<div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
			{/* Gradient overlay */}
			<div className="absolute inset-0 bg-gradient-to-br from-purple-900/50 to-transparent pointer-events-none" />

			<motion.div
				initial={{ opacity: 0, y: 20 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ duration: 0.6 }}
				className="max-w-md w-full relative z-10"
			>
				<div className="bg-slate-800 bg-opacity-50 backdrop-blur-lg rounded-2xl p-8 shadow-2xl border border-slate-700">
					{/* Success Icon */}
					<motion.div
						initial={{ scale: 0 }}
						animate={{ scale: 1 }}
						transition={{
							delay: 0.2,
							type: "spring",
							stiffness: 200,
							damping: 15,
						}}
						className="flex justify-center mb-6"
					>
						<div className="relative">
							<motion.div
								animate={{
									scale: [1, 1.2, 1],
									opacity: [0.5, 0.8, 0.5],
								}}
								transition={{
									duration: 2,
									repeat: Infinity,
									ease: "easeInOut",
								}}
								className="absolute inset-0 bg-green-500 rounded-full blur-xl"
							/>
							<CheckCircle
								className="w-20 h-20 text-green-400 relative z-10"
								strokeWidth={1.5}
							/>
						</div>
					</motion.div>

					{/* Heading */}
					<motion.h1
						initial={{ opacity: 0, y: 10 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ delay: 0.4 }}
						className="text-3xl font-bold text-white text-center mb-3"
					>
						Account Deleted
					</motion.h1>

					{/* Description */}
					<motion.p
						initial={{ opacity: 0 }}
						animate={{ opacity: 1 }}
						transition={{ delay: 0.5 }}
						className="text-gray-300 text-center mb-6"
					>
						Your account has been successfully deleted. All your data has been
						removed from our servers.
					</motion.p>

					{/* Action Buttons */}
					<motion.div
						initial={{ opacity: 0, y: 10 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ delay: 0.7 }}
						className="space-y-3"
					>
						<a href="/login">
							<motion.button
								whileHover={{ scale: 1.02 }}
								whileTap={{ scale: 0.98 }}
								className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold py-3 px-6 rounded-lg flex items-center justify-center gap-2 shadow-lg hover:shadow-purple-500/50 transition-shadow cursor-pointer"
							>
								Return to Login
								<ArrowRight className="w-5 h-5" />
							</motion.button>
						</a>
					</motion.div>

					{/* Footer Text */}
					<motion.p
						initial={{ opacity: 0 }}
						animate={{ opacity: 1 }}
						transition={{ delay: 0.8 }}
						className="text-xs text-gray-500 text-center mt-6"
					>
						Need help? Contact our support team
					</motion.p>
				</div>

				{/* Floating Particles */}
				{[...Array(5)].map((_, i) => (
					<motion.div
						key={i}
						className="absolute w-2 h-2 bg-purple-400 rounded-full"
						animate={{
							y: [0, -100, 0],
							x: [0, Math.random() * 100 - 50, 0],
							opacity: [0, 1, 0],
						}}
						transition={{
							duration: 3 + Math.random() * 2,
							repeat: Infinity,
							delay: i * 0.4,
						}}
						style={{
							left: `${20 + i * 15}%`,
							top: "50%",
						}}
					/>
				))}
			</motion.div>
		</div>
	)
}
