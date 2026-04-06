import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import { User } from "@/models/User";
import { isTokenExpired } from "@/utils/token";
import { sendEmail } from "@/lib/mailer";
import { emailVerifiedTemplate } from "@/templates/verificationConfirmed";
import bcrypt from "bcryptjs";

// GET - Validate token without verifying email
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const email = searchParams.get("email")?.toLowerCase().trim();
    const token = searchParams.get("token");

    if (!email || !token) {
      return NextResponse.json(
        { error: "Email and verification token are required." },
        { status: 400 }
      );
    }

    await connectToDatabase();
    const user = await User.findOne({ email });

    if (!user) {
      return NextResponse.json({ error: "User not found." }, { status: 404 });
    }

    // Check if already verified
    if (user.emailVerified) {
      return NextResponse.json(
        { error: "Email is already verified. Please log in." },
        { status: 400 }
      );
    }

    // Validate token
    if (
      user.verificationToken !== token ||
      !user.verificationTokenExpiry ||
      isTokenExpired(user.verificationTokenExpiry) ||
      user.verificationTokenPurpose !== "signup"
    ) {
      return NextResponse.json(
        { error: "Invalid or expired verification token." },
        { status: 400 }
      );
    }

    // Token is valid, but DON'T verify email yet
    return NextResponse.json(
      { 
        message: "Token is valid. Please enter your password to complete verification.",
        valid: true 
      },
      { status: 200 }
    );
  } catch (err) {
    console.error("Token validation error:", err);
    return NextResponse.json(
      { error: "Internal server error." },
      { status: 500 }
    );
  }
}

// POST - Verify email after password confirmation
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { email, token, password } = body;

    if (!email || !token || !password) {
      return NextResponse.json(
        { error: "Email, token, and password are required." },
        { status: 400 }
      );
    }

    await connectToDatabase();
    const user = await User.findOne({ email: email.toLowerCase().trim() });

    if (!user) {
      return NextResponse.json({ error: "User not found." }, { status: 404 });
    }

    // Check if already verified
    if (user.emailVerified) {
      return NextResponse.json(
        { error: "Email is already verified." },
        { status: 400 }
      );
    }

    // Validate token
    if (
      user.verificationToken !== token ||
      !user.verificationTokenExpiry ||
      isTokenExpired(user.verificationTokenExpiry) ||
      user.verificationTokenPurpose !== "signup"
    ) {
      return NextResponse.json(
        { error: "Invalid or expired verification token." },
        { status: 400 }
      );
    }

    // Verify password
    const isPasswordCorrect = await bcrypt.compare(password, user.password);
    if (!isPasswordCorrect) {
      return NextResponse.json(
        { error: "Incorrect password." },
        { status: 401 }
      );
    }

    // All checks passed - now verify the email
    Object.assign(user, {
      emailVerified: true,
      verificationToken: undefined,
      verificationTokenExpiry: undefined,
      verificationTokenPurpose: undefined,
    });
    await user.save();

    // Send confirmation email
    await sendEmail({
      to: user.email,
      subject: "Your Email is Now Verified",
      html: emailVerifiedTemplate(user.username || user.email),
    }).catch((err) =>
      console.error("Verification confirmation email failed:", err)
    );

    return NextResponse.json(
      { 
        message: "Email successfully verified.",
        verified: true 
      },
      { status: 200 }
    );
  } catch (err) {
    console.error("Verification error:", err);
    return NextResponse.json(
      { error: "Internal server error." },
      { status: 500 }
    );
  }
}