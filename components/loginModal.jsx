'use client'
import { motion, AnimatePresence } from "framer-motion";
import { signInWithPopup } from "firebase/auth";
import { auth, provider } from "../firebase/firebaseConfig";
import { FcGoogle } from "react-icons/fc"; // Google logo icon

export default function LoginModal({ open, setOpen }) {

  const handleGoogleLogin = async () => {
    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;
      console.log("Logged in user:", user);
      setOpen(false); // close modal
    } catch (err) {
      console.error(err);
      alert("Login failed");
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className="bg-white/10 backdrop-blur-lg rounded-3xl p-10 w-96 flex flex-col items-center gap-6 shadow-xl border border-white/20"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
          >
            {/* Website Name */}
            <h1 className="text-4xl font-extrabold text-red-400 mb-2">Invitect</h1>

            {/* Modal Title */}
            <h2 className="text-3xl font-bold text-white">Login</h2>
            <p className="text-gray-300 text-center">Sign in with your Google account</p>

            {/* Google Login Button */}
            <button
              onClick={handleGoogleLogin}
              className="flex items-center justify-center gap-3 w-full bg-white text-black px-6 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transition transform hover:-translate-y-1"
            >
              <FcGoogle size={24} />
              Login with Google
            </button>

            {/* Cancel Button */}
            <button
              onClick={() => setOpen(false)}
              className="text-gray-300 hover:text-white mt-2"
            >
              Cancel
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
