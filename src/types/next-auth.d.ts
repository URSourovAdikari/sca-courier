// types/next-auth.d.ts

import { DefaultSession } from "next-auth"


declare module "next-auth" {
  interface Session {
    user: {
      id: string
      name?: string | null
      email?: string | null
      image?: string | null
      role?: string | null
      emailVerified?: boolean | null
    } & DefaultSession["user"]
  }

  interface User {
    id: string
    name?: string | null
    email?: string | null
    image?: string | null
    role?: string | null
    emailVerified?: boolean | null
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string
    name?: string | null
    email?: string | null
    image?: string | null
    role?: string | null
    emailVerified?: boolean | null
  }
}
