import { betterAuth } from "better-auth"
import { MongoClient } from "mongodb"
import { mongodbAdapter } from "better-auth/adapters/mongodb"
import ENV from "../config/env.js"
import { username, bearer } from "better-auth/plugins"
import { type BetterAuthPlugin } from "better-auth"
import cloudinary from "../config/cloudinary.js"
import Post from "../models/post.model.js"
import Story from "../models/story.model.js"
import Comment from "../models/comment.model.js"
import { sendEmail } from "../config/nodemailer.js"
import type { GithubProfile, GoogleProfile } from "better-auth/social-providers"
import User from "../models/user.model.js"
import { socialBearer } from "../plugins/socialBearer.js"
const client = new MongoClient(ENV.MONGODB_URI)
const db = client.db()

const checkAlreadyTakenUsername = async (username: string) => {
	const user = await User.findOne({ username })
	return !!user
}

export const auth = betterAuth({
	database: mongodbAdapter(db, {
		client,
	}),

	emailAndPassword: {
		enabled: true,
		// requireEmailVerification: true,
		// autoSignIn: false,
		sendResetPassword: async ({ user, url }) => {
			const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Reset your password</title>
  <style>
    body { margin:0; padding:0; background-color:#f4f4f4; -webkit-font-smoothing:antialiased; }
    table { border-collapse:collapse; }
    a { color:inherit; }
  </style>
</head>
<body style="margin:0;padding:0;background-color:#f4f4f4;">
  <!-- Preheader -->
  <div style="display:none;max-height:0px;overflow:hidden;color:#f4f4f4;font-size:1px;line-height:1px;opacity:0;">
    Reset your Instagram account password securely.
  </div>

  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f4;padding:40px 0;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:8px;overflow:hidden;font-family:Arial,Helvetica,sans-serif;">
          <!-- Header -->
          <tr>
            <td style="background:#e1306c;padding:22px 20px;text-align:center;color:#ffffff;font-size:22px;font-weight:700;">
              Instagram
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:36px 34px;color:#333333;font-size:16px;line-height:1.6;">
              <p style="margin:0 0 12px 0;">Hi ${user?.name || "there"},</p>

              <p style="margin:0 0 12px 0;">
                We received a request to reset the password for your account. If this was you, click the button below to set a new password.
              </p>

              <p style="margin:0 0 20px 0;">
                This link will expire in <strong>1 hour</strong>.
              </p>

              <p style="text-align:center;margin:30px 0;">
                <a href="${url}" 
                   style="background:#e1306c;color:#ffffff;text-decoration:none;
                          padding:14px 28px;border-radius:6px;display:inline-block;
                          font-weight:700;font-size:16px;">
                  Reset Password
                </a>
              </p>

              <p style="margin:0 0 12px 0;">
                If you didn’t request this, you can safely ignore this email — your password will remain unchanged.
              </p>

              <p style="margin:18px 0 0 0;">— The Instagram Team</p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background:#fafafa;padding:18px;text-align:center;font-size:12px;color:#888888;">
              © ${new Date().getFullYear()} Instagram. All rights reserved.
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`
			await sendEmail(user.email, "Reset your password", html)
		},
		onPasswordReset: async ({ user }) => {
			const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Your password has been changed</title>
  <style>
    body { margin:0; padding:0; background-color:#f4f4f4; -webkit-font-smoothing:antialiased; }
    table { border-collapse:collapse; }
    a { color:inherit; }
  </style>
</head>
<body style="margin:0;padding:0;background-color:#f4f4f4;">
  <!-- Preheader -->
  <div style="display:none;max-height:0px;overflow:hidden;color:#f4f4f4;font-size:1px;line-height:1px;opacity:0;">
    Confirmation: Your Instagram password was changed.
  </div>

  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f4;padding:40px 0;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:8px;overflow:hidden;font-family:Arial,Helvetica,sans-serif;">
          <!-- Header -->
          <tr>
            <td style="background:#e1306c;padding:22px 20px;text-align:center;color:#ffffff;font-size:22px;font-weight:700;">
              Instagram
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:36px 34px;color:#333333;font-size:16px;line-height:1.6;">
              <p style="margin:0 0 12px 0;">Hi ${user?.name || "there"},</p>

              <p style="margin:0 0 12px 0;">
                This is a confirmation that your password was successfully changed.
              </p>

              <p style="margin:0 0 12px 0;">
                If you made this change, no further action is required.
              </p>

              <p style="margin:0 0 20px 0;">
                If you did <strong>not</strong> change your password, please reset it immediately to secure your account.
              </p>

                           <p style="margin:18px 0 0 0;">— The Instagram Team</p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background:#fafafa;padding:18px;text-align:center;font-size:12px;color:#888888;">
              © ${new Date().getFullYear()} Instagram. All rights reserved.
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`
			await sendEmail(user.email, "Your password has been changed", html)
		},
	},
	socialProviders: {
		github: {
			clientId: ENV.GITHUB_CLIENT_ID,
			clientSecret: ENV.GITHUB_CLIENT_SECRET,
			mapProfileToUser: async (profile: GithubProfile) => {
				if (await checkAlreadyTakenUsername(profile.login)) {
					profile.login = `${profile.login}${Math.floor(
						Math.random() * 10000000
					)}`
				}
				return {
					username: profile.login,
					email: profile.email,
					image: profile.avatar_url,
					bio: profile.bio || "",
				}
			},
		},
		google: {
			prompt: "select_account",
			clientId: ENV.GOOGLE_CLIENT_ID,
			clientSecret: ENV.GOOGLE_CLIENT_SECRET,
			mapProfileToUser: async (profile: GoogleProfile) => {
				if (
					await checkAlreadyTakenUsername(
						profile.name.replaceAll(" ", "_").toLowerCase()
					)
				) {
					profile.name = `${profile.name
						.replaceAll(" ", "_")
						.toLowerCase()}${Math.floor(Math.random() * 10000000)}`
				}
				return {
					username: profile.name.replaceAll(" ", "_").toLowerCase(),
					email: profile.email,
					image: profile.picture,
					name: profile.name || `${profile.given_name} ${profile.family_name}`,
				}
			},
		},
	},
	emailVerification: {
		// sendOnSignUp: true,
		sendVerificationEmail: async ({ user, url }) => {
			url = url.replace(
				/(callbackURL=)[^&]*/,
				`$1${ENV.FRONTEND_URL}/login?acc=verified`
			)
			const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Verify your email address</title>
  <style>
    /* Basic resets for email clients */
    body { margin:0; padding:0; background-color:#f4f4f4; -webkit-font-smoothing:antialiased; }
    table { border-collapse:collapse; }
    a { color:inherit; }
  </style>
</head>
<body style="margin:0;padding:0;background-color:#f4f4f4;">
  <!-- Preheader (hidden but shown in some inbox previews) -->
  <div style="display:none;max-height:0px;overflow:hidden;color:#f4f4f4;font-size:1px;line-height:1px;opacity:0;">
    Verify your email address to finish setting up your account.
  </div>

  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f4;padding:40px 0;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:8px;overflow:hidden;font-family:Arial,Helvetica,sans-serif;">
          <!-- Header -->
          <tr>
            <td style="background:#e1306c;padding:22px 20px;text-align:center;color:#ffffff;font-size:22px;font-weight:700;">
              Instagram
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:36px 34px;color:#333333;font-size:16px;line-height:1.6;">
              <p style="margin:0 0 12px 0;">Hi ${user?.name || "there"},</p>

              <p style="margin:0 0 12px 0;">
                Welcome to Instagram — please verify your email address so you can sign in and start using your account.
              </p>

              <p style="margin:0 0 20px 0;">
                Click the button below to verify your email. This link will expire in <strong>1 hour</strong>.
              </p>

              <p style="text-align:center;margin:30px 0;">
                <a href="${url}" 
                   style="background:#e1306c;color:#ffffff;text-decoration:none;
                          padding:14px 28px;border-radius:6px;display:inline-block;
                          font-weight:700;font-size:16px;">
                  Verify Email Address
                </a>
              </p>

              <p style="margin:0 0 12px 0;">
                If you didn't create an account with us, you can safely ignore this email.
              </p>

              <p style="margin:18px 0 0 0;">— The Instagram Team</p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background:#fafafa;padding:18px;text-align:center;font-size:12px;color:#888888;">
              © ${new Date().getFullYear()} Instagram. All rights reserved.
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`
			await sendEmail(user.email, "Verify your email address", html)
		},
	},
	trustedOrigins: [ENV.FRONTEND_URL],
	plugins: [username() as BetterAuthPlugin, bearer(), socialBearer()],
	user: {
		deleteUser: {
			enabled: true,
			afterDelete: async (user) => {
				await cloudinary.uploader.destroy(
					`instagram-clone/users/${user.id}/image`
				)
				await Post.deleteMany({ author: user.id })
				await Story.deleteMany({ author: user.id })
				await Comment.deleteMany({ author: user.id })
			},
			sendDeleteAccountVerification: async ({ url, user }) => {
				url = url.replace(
					/(callbackURL=)[^&]*/,
					`$1${ENV.FRONTEND_URL}/login?acc=deleted`
				)
				const html = `
  <!DOCTYPE html>
  <html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
    <title>Delete Your Account</title>
  </head>
  <body style="margin:0;padding:0;background-color:#f4f4f4;">
    <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f4;padding:40px 0;">
      <tr>
        <td align="center">
          <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:8px;overflow:hidden;font-family:Arial,sans-serif;">
            <!-- Header -->
            <tr>
              <td style="background:#e1306c;padding:24px;text-align:center;color:#ffffff;font-size:24px;font-weight:bold;">
                Instagram
              </td>
            </tr>
            <!-- Body -->
            <tr>
              <td style="padding:40px 30px;color:#333333;font-size:16px;line-height:1.6;">
                <p>Hello ${user.name || "there"},</p>
                <p>You requested to <strong>delete your account</strong>. This action is permanent and cannot be undone.</p>
                <p>To continue, please click the button below. The link will expire in <strong>1 hour</strong>.</p>

                <p style="text-align:center;margin:40px 0;">
                  <a href="${url}" 
                     style="background:#e1306c;color:#ffffff;text-decoration:none;
                            padding:14px 28px;border-radius:6px;display:inline-block;
                            font-weight:bold;font-size:16px;">
                    Delete My Account
                  </a>
                </p>

                <p>If you did not request this, you can safely ignore this email.</p>
                <p>— The Instagram Team</p>
              </td>
            </tr>
            <!-- Footer -->
            <tr>
              <td style="background:#fafafa;padding:20px;text-align:center;font-size:12px;color:#888888;">
                © ${new Date().getFullYear()} Instagram. All rights reserved.
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
  </html>
  `

				sendEmail(user.email, "Delete Your Account", html)
			},
		},
		additionalFields: {
			bio: {
				type: "string",
				defaultValue: "",
				required: false,
			},
			gender: {
				type: "string",
				defaultValue: "",
				required: false,
			},
			following: {
				type: "string[]",
				references: {
					model: "User",
					field: "_id",
				},
				defaultValue: [],
				required: false,
			},
			followers: {
				type: "string[]",
				references: {
					model: "User",
					field: "_id",
				},
				defaultValue: [],
				required: false,
			},
			blocked_users: {
				type: "string[]",
				references: {
					model: "User",
					field: "_id",
				},
				defaultValue: [],
				required: false,
			},
			bookmarks: {
				type: "string[]",
				references: {
					model: "Post",
					field: "_id",
				},
				defaultValue: [],
				required: false,
			},
		},
	},
})

export type Session = typeof auth.$Infer.Session
