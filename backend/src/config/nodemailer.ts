import * as nodemailer from "nodemailer"
import ENV from "./env.js"

const transporter = nodemailer.createTransport({
	service: "gmail",
	auth: {
		user: "rohityadav.se@gmail.com",
		pass: ENV.GOOGLE_APP_PASSWORD,
	},
})

export const sendEmail = async (to: string, subject: string, html: string) => {
	await transporter.sendMail({
		from: '"Instagram" <rohityadav.se@gmail.com>',
		to,
		subject,
		html,
	})
}
