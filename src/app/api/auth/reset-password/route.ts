import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { connectToDatabase } from "@/lib/db";
import { User } from "@/models/User";
import { sendEmail } from "@/lib/mailer";
import { passwordResetConfirmedTemplate } from "@/templates/passwordResetConfirmed";
import { emailVerifiedTemplate } from "@/templates/verificationConfirmed";

export async function POST(req: Request) {
  try {
    const { email, token, password, action } = await req.json();

    if (!email || !token) {
      return NextResponse.json({ error: "Email and token are required." }, { status: 400 });
    }

    await connectToDatabase();

    const user = await User.findOne({ email: email.toLowerCase().trim() });
    if (!user) {
      return NextResponse.json({ error: "User not found." }, { status: 404 });
    }

    const now = new Date();
    const isTokenValid =
      user.verificationToken === token &&
      user.verificationTokenExpiry &&
      user.verificationTokenExpiry > now &&
      user.verificationTokenPurpose === "password-reset";

    if (!isTokenValid) {
      return NextResponse.json(
        { error: "Invalid or expired reset token. Please request a new password reset.", valid: false },
        { status: 400 }
      );
    }

    // ✅ Step 1: Only token validation (frontend check)
    if (action === "verify") {
      return NextResponse.json({ valid: true, message: "Token is valid." }, { status: 200 });
    }

    // ✅ Step 2: Validate new password
    if (!password || password.length < 6) {
      return NextResponse.json(
        { error: "Password must be at least 6 characters long." },
        { status: 400 }
      );
    }

    const isSamePassword = await bcrypt.compare(password, user.password);
    if (isSamePassword) {
      return NextResponse.json(
        { error: "New password cannot be the same as your current password." },
        { status: 400 }
      );
    }

    // ✅ Step 3: Update password & mark email verified if not yet verified
    const emailJustVerified = !user.emailVerified;

    user.password = password;
    user.emailVerified = true;
    user.verificationToken = undefined;
    user.verificationTokenExpiry = undefined;
    user.verificationTokenPurpose = undefined;

    await user.save();

    // ✅ Step 4: Prepare emails
    const passwordResetEmail = sendEmail({
      to: user.email,
      subject: "Your Password Has Been Changed",
      html: passwordResetConfirmedTemplate(user.fullName || user.email),
    });

    const verificationEmail = emailJustVerified
      ? sendEmail({
          to: user.email,
          subject: "Your Email is Now Verified",
          html: emailVerifiedTemplate(user.fullName || user.email),
        })
      : Promise.resolve(); // Dummy promise to keep Promise.all clean

    // ✅ Step 5: Send both emails concurrently
    await Promise.all([passwordResetEmail, verificationEmail]);

    // ✅ Step 6: Final response
    return NextResponse.json(
      { message: "Password has been successfully updated." },
      { status: 200 }
    );
  } catch (error) {
    console.error("Reset password API error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
