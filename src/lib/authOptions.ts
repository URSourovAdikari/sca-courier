import { AuthOptions } from "next-auth";
import GitHubProvider from "next-auth/providers/github";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";

import { connectToDatabase } from "@/lib/db";
import { User } from "@/models/User";
import { generateToken, generateTokenExpiry, isTokenExpired } from "@/utils/token";
import { sendEmail } from "@/lib/mailer";
import { emailVerificationTemplate } from "@/templates/emailVerification";
import type { DefaultUser } from "next-auth";

interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: string;
  emailVerified: boolean;
}

interface ExtendedUser extends DefaultUser {
  id: string;
  role: string;
  emailVerified: boolean;
}

export const authOptions: AuthOptions = {
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/login",
  },
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        identifier: { label: "Email or Username", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        await connectToDatabase();

        const { identifier, password } = credentials ?? {};
        if (!identifier || !password) {
          throw new Error("Missing credentials");
        }

        // 1. Find user by email or username
        const user = await User.findOne({
          $or: [{ email: identifier }, { username: identifier }],
        });

        if (!user) {
          throw new Error("Invalid email/username or password");
        }

        // 2. Check password
        const isPasswordValid = await user.comparePassword(password);
        if (!isPasswordValid) {
          throw new Error("Invalid email/username or password");
        }

        // 3. If password is valid, check email verification
        if (!user.emailVerified) {
          const tokenInvalid =
            !user.verificationToken ||
            !user.verificationTokenExpiry ||
            isTokenExpired(user.verificationTokenExpiry) ||
            user.verificationTokenPurpose !== "signup";

          if (tokenInvalid) {
            // Generate new token
            const newToken = generateToken();
            const newExpiry = generateTokenExpiry(5);

            user.verificationToken = newToken;
            user.verificationTokenExpiry = newExpiry;
            user.verificationTokenPurpose = "signup";

            await user.save();

            const verifyUrl = `${process.env.NEXT_PUBLIC_APP_URL}/verify?token=${newToken}&email=${encodeURIComponent(user.email)}`;
            console.log(verifyUrl);
            try {
              await sendEmail({
                to: user.email,
                subject: "Verify your email",
                html: emailVerificationTemplate(user.username || user.email, verifyUrl),
              });
            } catch (err) {
              console.error("Failed to send verification email:", err);
            }

            throw new Error("Please verify your email. We've sent you a new verification link.");
          }

          throw new Error("Please verify your email using the link we already sent.");
        }

        // 4. All checks passed — return user including emailVerified
        return {
          id: user._id.toString(),
          name: user.fullName,
          email: user.email,
          role: user.role,
          emailVerified: user.emailVerified,
        } as AuthUser;
      },
    }),

    GitHubProvider({
      clientId: process.env.GITHUB_CLIENT_ID!,
      clientSecret: process.env.GITHUB_CLIENT_SECRET!,
    }),
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],

  callbacks: {
    async jwt({ token, user, trigger, session }) {
      if (user) {
        const u = user as AuthUser;
        token.id = u.id;
        token.email = u.email;
        token.name = u.name;
        token.role = u.role;
        token.emailVerified = u.emailVerified ?? false;
      }
      
      // Handle the session update trigger
      if (trigger === "update" && session?.user?.name) {
        token.name = session.user.name;
      }
      
      return token;
    },

    async session({ session, token }) {
      if (session.user && token) {
        session.user.id = token.id as string;
        session.user.email = token.email ?? null;
        session.user.name = token.name ?? null;
        session.user.role = token.role ?? null;
        session.user.emailVerified = token.emailVerified ?? false; // <-- add emailVerified here
      }
      return session;
    },

    async signIn({ user, account }) {
      await connectToDatabase();

      if (account?.provider === "github" || account?.provider === "google") {
        const email = user.email;
        if (!email) return false;

        let dbUser = await User.findOne({ email });

        if (!dbUser) {
          const username = email.split("@")[0] || `user_${Date.now()}`;

          dbUser = await User.create({
            fullName: user.name || username,
            email,
            username,
            password: Math.random().toString(36).slice(-8), // Random password
            role: "user",
            emailVerified: true,
          });
        } else if (!dbUser.emailVerified) {
          dbUser.emailVerified = true;
          await dbUser.save();
        }

        const extendedUser = user as ExtendedUser;
        extendedUser.role = dbUser.role;
        extendedUser.id = dbUser._id.toString();
        extendedUser.emailVerified = dbUser.emailVerified; // <-- add emailVerified here
      }

      return true;
    },
  },
};
