'use client';
import { useEffect, useState } from "react";
import { useAuth } from "../context/authContext";
import { useRouter } from "next/navigation";
import LoginModal from "./LoginModal";
import { getAuth, signOut, onIdTokenChanged } from "firebase/auth";
import Loader from "./LoaderComponent";

export default function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [loginOpen, setLoginOpen] = useState(false);
  const auth = getAuth();

  useEffect(() => {
    const unsubscribe = onIdTokenChanged(auth, (currentUser) => {
      if (!currentUser) {
        setLoginOpen(true);
        router.push("/");
      }
    });
    return () => unsubscribe();
  }, [auth, router]);

  if (loading || !user) return <Loader />;

  return (
    <>
      {children}
      {loginOpen && <LoginModal open={loginOpen} setOpen={setLoginOpen} />}
    </>
  );
}
