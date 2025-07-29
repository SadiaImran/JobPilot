import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../supabase";

export default function AuthCallback() {
  const navigate = useNavigate();

  useEffect(() => {
    async function checkSession() {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        console.log("Session restored ✅", session);

        // 🧼 Clean up token from URL
        window.history.replaceState({}, document.title, "/auth/callback");

        // ✅ Redirect user after verifying session
        setTimeout(() => {
          navigate("/");
        }, 1000);
      } else {
        console.log("No session found.");
        navigate("/");
      }
    }

    checkSession();
  }, []);

  return (
    <div className="p-8 text-center">
      <h2 className="text-2xl font-bold">Email verified ✅</h2>
      <p>Redirecting you to login...</p>
    </div>
  );
}
