"use client";
import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import Link from "next/link";
import { TrendingUp, Bike, Building2, Calendar, Percent, Navigation, LogOut } from "lucide-react";

const tabs = [
  ["/admin", "Dashboard", TrendingUp],
  ["/admin/motors", "Motor", Bike],
  ["/admin/branches", "Cabang", Building2],
  ["/admin/bookings", "Pesanan", Calendar],
  ["/admin/promos", "Promo", Percent],
  ["/admin/gps", "Monitoring GPS", Navigation],
];

export default function AdminLayout({ children }) {
  const pathname = usePathname();
  const router = useRouter();
  const [session, setSession] = useState(undefined);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSession(data.session));
    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => setSession(s));
    return () => sub.subscription.unsubscribe();
  }, []);

  if (pathname === "/admin/login") return children;

  if (session === undefined) {
    return <div className="text-center py-16 text-sm text-muted">Memeriksa sesi login...</div>;
  }
  if (!session) {
    router.push("/admin/login");
    return null;
  }

  return (
    <div>
      <div className="flex items-center justify-between flex-wrap gap-3 mb-5">
        <div className="flex items-center gap-1 p-1 rounded-lg w-fit flex-wrap bg-white border border-line">
          {tabs.map(([href, label, Icon]) => (
            <Link
              key={href}
              href={href}
              className={"px-3 py-1.5 rounded-md text-sm font-medium flex items-center gap-1.5 " + (pathname === href ? "bg-ink text-paper" : "text-muted")}
            >
              <Icon size={14} /> {label}
            </Link>
          ))}
        </div>
        <button
          onClick={async () => { await supabase.auth.signOut(); router.push("/admin/login"); }}
          className="px-2 py-1.5 rounded-md text-sm flex items-center gap-1"
          style={{ color: "#D64545" }}
        >
          <LogOut size={14} /> Keluar
        </button>
      </div>
      {children}
    </div>
  );
}
