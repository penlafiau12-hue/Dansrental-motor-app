"use client";
import { useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";
import { ShieldCheck } from "lucide-react";
import { Button, Input } from "@/components/UI";

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const login = async () => {
    setLoading(true);
    setError("");
    const { error: err } = await supabase.auth.signInWithPassword({ email, password });
    if (err) {
      setError(err.message);
      setLoading(false);
      return;
    }
    router.push("/admin");
  };

  return (
    <div className="max-w-sm mx-auto mt-16 p-6 rounded-xl border bg-white border-line">
      <div className="flex justify-center mb-3">
        <div className="w-12 h-12 rounded-full flex items-center justify-center" style={{ background: "#FDECE2" }}>
          <ShieldCheck size={22} color="#FF7A30" />
        </div>
      </div>
      <h3 className="text-center font-bold mb-1 text-ink">Login Admin</h3>
      <p className="text-center text-xs mb-4 text-muted">
        Gunakan akun yang sudah dibuat di Supabase Authentication dan didaftarkan di tabel <code>admins</code>.
      </p>
      <div className="mb-2"><Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email admin" /></div>
      <div className="mb-2"><Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password" /></div>
      {error && <p className="text-xs text-center mb-2" style={{ color: "#D64545" }}>{error}</p>}
      <Button variant="primary" onClick={login} disabled={loading} className="w-full text-center">
        {loading ? "Memproses..." : "Masuk"}
      </Button>
    </div>
  );
}
