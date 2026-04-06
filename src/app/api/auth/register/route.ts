import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import { User } from "@/models/User";
import { generateToken, generateTokenExpiry } from "@/utils/token";
import { sendEmail } from "@/lib/mailer";
import { emailVerificationTemplate } from "@/templates/emailVerification";

export async function POST(req: Request) {
  try {
    const { fullName, email, username, password } = await req.json();

    if (!fullName || !email || !username || !password) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    await connectToDatabase();

    const emailSanitized = email.toLowerCase().trim();
    const usernameSanitized = username.toLowerCase().trim();

    const existingUser = await User.findOne({
      $or: [{ email: emailSanitized }, { username: usernameSanitized }],
    });

    if (existingUser) {
      const error = existingUser.email === emailSanitized
        ? "Email already in use"
        : "Username already taken";
      return NextResponse.json({ error }, { status: 409 });
    }

    const token = generateToken();

    await User.create({
      fullName,
      email: emailSanitized,
      username: usernameSanitized,
      password, // hashed in pre-save hook
      role: "user",
      emailVerified: false,
      verificationToken: token,
      verificationTokenExpiry: generateTokenExpiry(),
      verificationTokenPurpose: "signup",
    });

    const verificationUrl = `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/verify?email=${encodeURIComponent(emailSanitized)}&token=${encodeURIComponent(token)}`;
console.log(verificationUrl);

    await sendEmail({
      to: emailSanitized,
      subject: "Verify Your Email",
      html: emailVerificationTemplate(fullName || usernameSanitized, verificationUrl),
    });

    return NextResponse.json({ message: "User created. Verification email sent." }, { status: 201 });
  } catch (error) {
    console.error("Signup error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
