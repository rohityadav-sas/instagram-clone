"use client"

import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import { authClient } from "@/auth/auth-client"

export default function ResetPasswordComponent() {
	const [password, setPassword] = useState("")
	const [confirmPassword, setConfirmPassword] = useState("")
	const [showPassword, setShowPassword] = useState(false)
	const [showConfirmPassword, setShowConfirmPassword] = useState(false)
	const [isLoading, setIsLoading] = useState(false)
	const [isSuccess, setIsSuccess] = useState(false)
	const [errors, setErrors] = useState({ password: "", confirmPassword: "" })
	const [token, setToken] = useState<string | null>(null)
	const [isTokenChecked, setIsTokenChecked] = useState(false)

	useEffect(() => {
		const token = new URLSearchParams(window.location.search).get("token")
		if (token) {
			setToken(token)
		}
		setIsTokenChecked(true)
	}, [])

	if (!isTokenChecked) {
		return null
	}

	if (!token) {
		return (
			<div className="min-h-screen bg-gradient-to-br from-purple-600 via-blue-600 to-cyan-500 flex items-center justify-center p-4">
				<div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full text-center">
					<h2 className="text-2xl font-bold mb-4">Invalid Token</h2>
					<p className="text-gray-600">
						The password reset token is missing or invalid.
					</p>
					<motion.div
						initial={{ opacity: 0 }}
						animate={{ opacity: 1 }}
						transition={{ delay: 0.6 }}
						className="mt-6 text-center"
					>
						<a
							href="/login"
							className="text-purple-600 hover:text-purple-700 text-sm font-medium"
						>
							Back to Login
						</a>
					</motion.div>
				</div>
			</div>
		)
	}

	const validatePassword = (pwd: string) => {
		if (pwd.length < 8) {
			return "Password must be at least 8 characters"
		}
		if (!/(?=.*[a-z])/.test(pwd)) {
			return "Password must contain a lowercase letter"
		}
		if (!/(?=.*[A-Z])/.test(pwd)) {
			return "Password must contain an uppercase letter"
		}
		if (!/(?=.*\d)/.test(pwd)) {
			return "Password must contain a number"
		}
		return ""
	}

	const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault()

		const passwordError = validatePassword(password)
		const confirmError =
			password !== confirmPassword ? "Passwords do not match" : ""

		setErrors({ password: passwordError, confirmPassword: confirmError })

		if (passwordError || confirmError) return

		setIsLoading(true)
		const { error } = await authClient.resetPassword({
			token,
			newPassword: password,
		})
		if (error) {
			setErrors({ password: error.message!, confirmPassword: "" })
			setIsLoading(false)
			return
		}
		setIsLoading(false)
		setIsSuccess(true)
	}

	const passwordStrength = () => {
		if (password.length === 0) return 0
		let strength = 0
		if (password.length >= 8) strength++
		if (/(?=.*[a-z])/.test(password)) strength++
		if (/(?=.*[A-Z])/.test(password)) strength++
		if (/(?=.*\d)/.test(password)) strength++
		if (/(?=.*[@$!%*?&])/.test(password)) strength++
		return strength
	}

	const strength = passwordStrength()
	const strengthColors = [
		"bg-gray-200",
		"bg-red-500",
		"bg-orange-500",
		"bg-yellow-500",
		"bg-lime-500",
		"bg-green-500",
	]
	const strengthLabels = ["", "Very Weak", "Weak", "Fair", "Good", "Strong"]

	if (isSuccess) {
		return (
			<div className="min-h-screen bg-gradient-to-br from-purple-600 via-blue-600 to-cyan-500 flex items-center justify-center p-4">
				<motion.div
					initial={{ scale: 0.8, opacity: 0 }}
					animate={{ scale: 1, opacity: 1 }}
					className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full text-center"
				>
					<motion.div
						initial={{ scale: 0 }}
						animate={{ scale: 1 }}
						transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
						className="w-20 h-20 bg-green-500 rounded-full mx-auto mb-6 flex items-center justify-center"
					>
						<svg
							className="w-10 h-10 text-white"
							fill="none"
							stroke="currentColor"
							viewBox="0 0 24 24"
						>
							<path
								strokeLinecap="round"
								strokeLinejoin="round"
								strokeWidth={3}
								d="M5 13l4 4L19 7"
							/>
						</svg>
					</motion.div>
					<h2 className="text-3xl font-bold text-gray-800 mb-3">
						Password Reset!
					</h2>
					<p className="text-gray-600 mb-6">
						Your password has been successfully reset. You can now log in with
						your new password.
					</p>
					<motion.button
						whileHover={{ scale: 1.05 }}
						whileTap={{ scale: 0.95 }}
						onClick={() => (window.location.href = "/login")}
						className="w-full cursor-pointer bg-gradient-to-r from-purple-600 to-blue-600 text-white py-3 rounded-lg font-semibold"
					>
						Go to Login
					</motion.button>
				</motion.div>
			</div>
		)
	}

	return (
		<div className="min-h-screen bg-gradient-to-br from-purple-600 via-blue-600 to-cyan-500 flex items-center justify-center p-4">
			<motion.div
				initial={{ y: 20, opacity: 0 }}
				animate={{ y: 0, opacity: 1 }}
				transition={{ duration: 0.5 }}
				className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full"
			>
				<motion.div
					initial={{ scale: 0.5, opacity: 0 }}
					animate={{ scale: 1, opacity: 1 }}
					transition={{ delay: 0.2 }}
					className="text-center mb-8"
				>
					<div className="w-16 h-16 bg-gradient-to-r from-purple-600 to-blue-600 rounded-full mx-auto mb-4 flex items-center justify-center">
						<svg
							className="w-8 h-8 text-white"
							fill="none"
							stroke="currentColor"
							viewBox="0 0 24 24"
						>
							<path
								strokeLinecap="round"
								strokeLinejoin="round"
								strokeWidth={2}
								d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
							/>
						</svg>
					</div>
					<h1 className="text-3xl font-bold text-gray-800 mb-2">
						Reset Password
					</h1>
					<p className="text-gray-600">Enter your new password below</p>
				</motion.div>

				<form onSubmit={handleSubmit} className="space-y-6">
					<motion.div
						initial={{ x: -20, opacity: 0 }}
						animate={{ x: 0, opacity: 1 }}
						transition={{ delay: 0.3 }}
					>
						<label className="block text-sm font-medium text-gray-700 mb-2">
							New Password
						</label>
						<div className="relative">
							<input
								type={showPassword ? "text" : "password"}
								value={password}
								onChange={(e) => setPassword(e.target.value)}
								className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent outline-none transition"
								placeholder="Enter new password"
							/>
							<button
								type="button"
								onClick={() => setShowPassword(!showPassword)}
								className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
							>
								{showPassword ? (
									<svg
										className="w-5 h-5"
										fill="none"
										stroke="currentColor"
										viewBox="0 0 24 24"
									>
										<path
											strokeLinecap="round"
											strokeLinejoin="round"
											strokeWidth={2}
											d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"
										/>
									</svg>
								) : (
									<svg
										className="w-5 h-5"
										fill="none"
										stroke="currentColor"
										viewBox="0 0 24 24"
									>
										<path
											strokeLinecap="round"
											strokeLinejoin="round"
											strokeWidth={2}
											d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
										/>
										<path
											strokeLinecap="round"
											strokeLinejoin="round"
											strokeWidth={2}
											d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
										/>
									</svg>
								)}
							</button>
						</div>
						{password && (
							<motion.div
								initial={{ opacity: 0, height: 0 }}
								animate={{ opacity: 1, height: "auto" }}
								className="mt-2"
							>
								<div className="flex gap-1 mb-1">
									{[1, 2, 3, 4, 5].map((i) => (
										<div
											key={i}
											className={`h-1 flex-1 rounded-full transition-colors ${
												i <= strength ? strengthColors[strength] : "bg-gray-200"
											}`}
										/>
									))}
								</div>
								<p className="text-xs text-gray-600">
									{strengthLabels[strength]}
								</p>
							</motion.div>
						)}
						{errors.password && (
							<motion.p
								initial={{ opacity: 0 }}
								animate={{ opacity: 1 }}
								className="text-red-500 text-sm mt-1"
							>
								{errors.password}
							</motion.p>
						)}
					</motion.div>

					<motion.div
						initial={{ x: -20, opacity: 0 }}
						animate={{ x: 0, opacity: 1 }}
						transition={{ delay: 0.4 }}
					>
						<label className="block text-sm font-medium text-gray-700 mb-2">
							Confirm Password
						</label>
						<div className="relative">
							<input
								type={showConfirmPassword ? "text" : "password"}
								value={confirmPassword}
								onChange={(e) => setConfirmPassword(e.target.value)}
								className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent outline-none transition"
								placeholder="Confirm new password"
							/>
							<button
								type="button"
								onClick={() => setShowConfirmPassword(!showConfirmPassword)}
								className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
							>
								{showConfirmPassword ? (
									<svg
										className="w-5 h-5"
										fill="none"
										stroke="currentColor"
										viewBox="0 0 24 24"
									>
										<path
											strokeLinecap="round"
											strokeLinejoin="round"
											strokeWidth={2}
											d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"
										/>
									</svg>
								) : (
									<svg
										className="w-5 h-5"
										fill="none"
										stroke="currentColor"
										viewBox="0 0 24 24"
									>
										<path
											strokeLinecap="round"
											strokeLinejoin="round"
											strokeWidth={2}
											d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
										/>
										<path
											strokeLinecap="round"
											strokeLinejoin="round"
											strokeWidth={2}
											d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
										/>
									</svg>
								)}
							</button>
						</div>
						{errors.confirmPassword && (
							<motion.p
								initial={{ opacity: 0 }}
								animate={{ opacity: 1 }}
								className="text-red-500 text-sm mt-1"
							>
								{errors.confirmPassword}
							</motion.p>
						)}
					</motion.div>

					<motion.button
						initial={{ y: 20, opacity: 0 }}
						animate={{ y: 0, opacity: 1 }}
						transition={{ delay: 0.5 }}
						whileHover={{ scale: 1.02 }}
						whileTap={{ scale: 0.98 }}
						type="submit"
						disabled={isLoading}
						className="w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white py-3 rounded-lg font-semibold hover:shadow-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
					>
						{isLoading ? (
							<span className="flex items-center justify-center gap-2">
								<svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
									<circle
										className="opacity-25"
										cx="12"
										cy="12"
										r="10"
										stroke="currentColor"
										strokeWidth="4"
										fill="none"
									/>
									<path
										className="opacity-75"
										fill="currentColor"
										d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
									/>
								</svg>
								Resetting...
							</span>
						) : (
							"Reset Password"
						)}
					</motion.button>
				</form>

				<motion.div
					initial={{ opacity: 0 }}
					animate={{ opacity: 1 }}
					transition={{ delay: 0.6 }}
					className="mt-6 text-center"
				>
					<a
						href="/login"
						className="text-purple-600 hover:text-purple-700 text-sm font-medium"
					>
						Back to Login
					</a>
				</motion.div>
			</motion.div>
		</div>
	)
}
