import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function AuthCallback() {
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setTimeout(() => {
      navigate("/"); 
    }, 4000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="text-center p-10">
      <h2 className="text-2xl font-bold">✅ Email verified!</h2>
      <p className="mt-2 text-gray-600">You can now log in. Redirecting you shortly...</p>
    </div>
  );
}
