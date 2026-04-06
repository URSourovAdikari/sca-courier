import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { connectToDatabase } from "@/lib/db";
import { User } from "@/models/User";
import bcrypt from "bcryptjs";


export async function PATCH(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectToDatabase();
    const body = await req.json();
    const { action } = body;

    const user = await User.findById(session.user.id);
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // ── Update Name ─────────────────────────────────────────────────────────
    if (action === "update-name") {
      const { fullName } = body;
      if (!fullName || fullName.trim().length < 2) {
        return NextResponse.json({ error: "Name must be at least 2 characters." }, { status: 400 });
      }
      user.fullName = fullName.trim();
      await user.save();
      return NextResponse.json({ success: true, name: user.fullName });
    }

    // ── Change Password ──────────────────────────────────────────────────────
    if (action === "change-password") {
      const { currentPassword, newPassword } = body;

      if (!currentPassword || !newPassword) {
        return NextResponse.json({ error: "All fields are required." }, { status: 400 });
      }

      const isMatch = await user.comparePassword(currentPassword);
      if (!isMatch) {
        return NextResponse.json({ error: "Current password is incorrect." }, { status: 400 });
      }

      const isSamePassword = await user.comparePassword(newPassword);
      if (isSamePassword) {
        return NextResponse.json({ error: "New password must be different from your current password." }, { status: 400 });
      }

      const strongPassword =
        newPassword.length >= 6 &&
        /[A-Z]/.test(newPassword) &&
        /[0-9]/.test(newPassword) &&
        /[^a-zA-Z0-9]/.test(newPassword);

      if (!strongPassword) {
        return NextResponse.json(
          { error: "Password must be 6+ characters with uppercase, number, and special character." },
          { status: 400 }
        );
      }

      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(newPassword, salt);
      // Mark modified so Mongoose doesn't re-hash via pre-save hook
      user.markModified("password");

      // Bypass the pre-save hook by using findByIdAndUpdate for password
      await User.findByIdAndUpdate(user._id, { password: user.password });

      return NextResponse.json({ success: true });
    }



    return NextResponse.json({ error: "Unknown action." }, { status: 400 });
  } catch (err) {
    console.error("[PATCH /api/user/profile]", err);
    return NextResponse.json({ error: "Internal server error." }, { status: 500 });
  }
}
