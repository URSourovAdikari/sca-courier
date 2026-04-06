"use client";

import Header from "@/components/Header";
import AdminHeader from "@/components/admin/Header";
import { useAuth } from "@/components/AuthProvider";

export default function RoleBasedHeader() {
  const { session, status } = useAuth();

  // While session is loading, avoid mismatch by rendering nothing
  if (status === "loading") return null;

  if (session?.user.role === "admin") {
    return <AdminHeader />;
  }

  return <Header />;
}
