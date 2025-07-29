import { useEffect } from "react";

export default function EmailVerified() {
  useEffect(() => {
    // Clean up the access_token and other hash params
    if (window.location.hash) {
      window.history.replaceState(null, "", window.location.pathname);
    }
  }, []);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center text-center p-6">
      <h1 className="text-2xl font-bold mb-4">✅ Email Verified!</h1>
      <p>You can now go back and log in.</p>
    </div>
  );
}
