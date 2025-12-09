import { LogOut } from "lucide-react";
import { supabase } from "../lib/supabaseClient";
import { useNavigate } from "react-router";

export default function Account() {
  const navigate = useNavigate();

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error("Logout error:", error);
    } else {
      navigate("/auth");
    }
  };

  return (
    <div className="flex flex-col items-center justify-start min-h-screen bg-base-100 p-4">
      <div className="w-full max-w-md mt-8">
        <button onClick={handleLogout} className="btn btn-error w-full gap-2">
          <LogOut size={20} />
          Logout
        </button>
      </div>
    </div>
  );
}
