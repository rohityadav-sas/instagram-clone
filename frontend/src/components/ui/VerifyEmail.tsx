"use client"

import { easeInOut, easeOut, motion, spring } from "framer-motion"
import { CheckCircle, Sparkles, Mail } from "lucide-react"
import { useEffect } from "react"

export default function EmailVerifiedSuccess() {
	useEffect(() => {
		window.history.replaceState({}, "", "/")
	}, [])
	const containerVariants = {
		hidden: { opacity: 0 },
		visible: {
			opacity: 1,
			transition: {
				duration: 0.8,
				staggerChildren: 0.15,
			},
		},
	}

	const itemVariants = {
		hidden: { opacity: 0, y: 30 },
		visible: {
			opacity: 1,
			y: 0,
			transition: {
				duration: 0.6,
				ease: easeOut,
			},
		},
	}

	const checkVariants = {
		hidden: { scale: 0, rotate: -180 },
		visible: {
			scale: 1,
			rotate: 0,
			transition: {
				type: spring,
				stiffness: 200,
				damping: 15,
				delay: 0.2,
			},
		},
	}

	const sparkleVariants = {
		animate: {
			scale: [1, 1.2, 1],
			rotate: [0, 180, 360],
			opacity: [0.5, 1, 0.5],
			transition: {
				duration: 3,
				repeat: Infinity,
				ease: easeInOut,
			},
		},
	}

	return (
		<div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 flex items-center justify-center p-4 relative overflow-hidden">
			{/* Animated background elements */}
			<motion.div
				className="absolute top-20 left-20 w-72 h-72 bg-emerald-200 rounded-full opacity-20 blur-3xl"
				animate={{
					scale: [1, 1.2, 1],
					x: [0, 50, 0],
					y: [0, 30, 0],
				}}
				transition={{
					duration: 8,
					repeat: Infinity,
					ease: "easeInOut",
				}}
			/>
			<motion.div
				className="absolute bottom-20 right-20 w-96 h-96 bg-teal-300 rounded-full opacity-20 blur-3xl"
				animate={{
					scale: [1, 1.3, 1],
					x: [0, -30, 0],
					y: [0, -50, 0],
				}}
				transition={{
					duration: 10,
					repeat: Infinity,
					ease: "easeInOut",
				}}
			/>

			<motion.div
				variants={containerVariants}
				initial="hidden"
				animate="visible"
				className="w-full max-w-2xl relative z-10"
			>
				<motion.div className="bg-white/80 backdrop-blur-lg rounded-3xl shadow-2xl p-12 space-y-8 border border-white/20">
					{/* Success Icon with Sparkles */}
					<motion.div
						variants={itemVariants}
						className="flex justify-center relative"
					>
						{/* Sparkles */}
						<motion.div
							variants={sparkleVariants}
							animate="animate"
							className="absolute -top-4 -left-4"
						>
							<Sparkles className="w-6 h-6 text-yellow-400" />
						</motion.div>
						<motion.div
							variants={sparkleVariants}
							animate="animate"
							className="absolute -top-4 -right-4"
							style={{ animationDelay: "1s" }}
						>
							<Sparkles className="w-6 h-6 text-yellow-400" />
						</motion.div>
						<motion.div
							variants={sparkleVariants}
							animate="animate"
							className="absolute -bottom-2 left-8"
							style={{ animationDelay: "2s" }}
						>
							<Sparkles className="w-5 h-5 text-yellow-400" />
						</motion.div>
						<motion.div
							variants={sparkleVariants}
							animate="animate"
							className="absolute -bottom-2 right-8"
							style={{ animationDelay: "1.5s" }}
						>
							<Sparkles className="w-5 h-5 text-yellow-400" />
						</motion.div>

						{/* Main Check Icon */}
						<motion.div variants={checkVariants} className="relative">
							<div className="w-32 h-32 bg-gradient-to-br from-emerald-500 via-teal-500 to-cyan-500 rounded-full flex items-center justify-center shadow-lg">
								<CheckCircle
									className="w-20 h-20 text-white"
									strokeWidth={2.5}
								/>
							</div>

							{/* Pulse rings */}
							<motion.div
								className="absolute inset-0 rounded-full border-4 border-emerald-400"
								animate={{
									scale: [1, 1.5, 1.5],
									opacity: [0.5, 0, 0],
								}}
								transition={{
									duration: 2,
									repeat: Infinity,
									ease: "easeOut",
								}}
							/>
							<motion.div
								className="absolute inset-0 rounded-full border-4 border-teal-400"
								animate={{
									scale: [1, 1.8, 1.8],
									opacity: [0.4, 0, 0],
								}}
								transition={{
									duration: 2,
									delay: 0.4,
									repeat: Infinity,
									ease: "easeOut",
								}}
							/>
						</motion.div>
					</motion.div>

					{/* Heading */}
					<motion.div variants={itemVariants} className="text-center space-y-4">
						<h1 className="text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600">
							Email Verified!
						</h1>
						<p className="text-xl text-gray-600 font-medium">
							Your email has been successfully verified
						</p>
					</motion.div>

					{/* Success Message */}
					<motion.div
						variants={itemVariants}
						className="bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200 rounded-2xl p-6 space-y-3"
					>
						<div className="flex items-start gap-3">
							<div className="w-6 h-6 bg-emerald-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
								<Mail className="w-3.5 h-3.5 text-white" />
							</div>
							<div>
								<h3 className="font-semibold text-gray-800 text-lg mb-1">
									You're all set!
								</h3>
								<p className="text-gray-600 leading-relaxed">
									Your account is now active and ready to use. You can now
									access all features and start exploring everything we have to
									offer.
								</p>
							</div>
						</div>
					</motion.div>

					{/* Login Link */}
					<motion.div variants={itemVariants} className="text-center">
						<a
							href="/profile"
							className="inline-block px-8 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl hover:from-emerald-700 hover:to-teal-700 transition-all duration-300"
						>
							Back to Instagram
						</a>
					</motion.div>
				</motion.div>
			</motion.div>
		</div>
	)
}
