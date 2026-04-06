import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import { User } from "@/models/User";
import { generateToken, generateTokenExpiry, isTokenExpired } from "@/utils/token";
import { sendEmail } from "@/lib/mailer";
import { passwordResetTemplate } from "@/templates/passwordReset";

export async function POST(req: Request) {
  try {
    const { identifier } = await req.json();
    if (!identifier?.trim()) {
      return NextResponse.json({ error: "Email or username is required." }, { status: 400 });
    }

    await connectToDatabase();
    const user = await User.findOne({
      $or: [
        { email: identifier.toLowerCase().trim() },
        { username: identifier.toLowerCase().trim() },
      ],
    });
    if (!user) return NextResponse.json({ error: "User not found." }, { status: 404 });

    const tokenInvalid =
      !user.verificationToken ||
      !user.verificationTokenExpiry ||
      isTokenExpired(user.verificationTokenExpiry) ||
      user.verificationTokenPurpose !== "password-reset";

    if (tokenInvalid) {
      const token = generateToken();
      user.verificationToken = token;
      user.verificationTokenExpiry = generateTokenExpiry(5);
      user.verificationTokenPurpose = "password-reset";
      await user.save();

      const resetUrl = `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/new-password?email=${encodeURIComponent(user.email)}&token=${encodeURIComponent(token)}`;
      console.log(resetUrl);
      await sendEmail({
        to: user.email,
        subject: "Reset Your Password",
        html: passwordResetTemplate(user.fullName || user.email, resetUrl),
      });

      return NextResponse.json(
        { message: "✅ A password reset link has been sent to your email." },
        { status: 200 }
      );
    }

    return NextResponse.json(
      { message: "🕓 A reset link was already sent. Please check your inbox." },
      { status: 200 }
    );
  } catch (err) {
    console.error("Forgot password error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
