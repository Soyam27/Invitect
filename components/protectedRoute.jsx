'use client';
import { useEffect } from "react";
import { useAuth } from "../context/authContext";
import { useRouter } from "next/navigation";

export default function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push("/"); // redirect to homepage if not logged in
    }
  }, [user, loading, router]);

  if (loading || !user) return null; // block content until logged in

  return <>{children}</>;
}
