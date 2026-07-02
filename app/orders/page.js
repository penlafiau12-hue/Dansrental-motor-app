"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { fmt } from "@/lib/helpers";
import { Badge } from "@/components/UI";
import { MapPin, Calendar } from "lucide-react";

export default function OrdersPage() {
  const [bookings, setBookings] = useState([]);
  const [motors, setMotors] = useState({});
  const [branches, setBranches] = useState({});
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    (async () => {
      const [{ data: bk }, { data: mt }, { data: br }] = await Promise.all([
        supabase.from("bookings").select("*").order("created_at", { ascending: false }),
        supabase.from("motors").select("*"),
        supabase.from("branches").select("*"),
      ]);
      setBookings(bk || []);
      setMotors(Object.fromEntries((mt || []).map((m) => [m.id, m])));
      setBranches(Object.fromEntries((br || []).map((b) => [b.id, b])));
      setLoading(false);
    })();
  }, []);

  const filtered = search
    ? bookings.filter((b) => b.phone.includes(search) || b.email.toLowerCase().includes(search.toLowerCase()))
    : bookings;

  if (loading) return <div className="text-center py-16 text-sm text-muted">Memuat...</div>;

  return (
    <div>
      <div className="mb-4">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Cari pesanan dengan no. HP atau email..."
          className="w-full max-w-sm px-3 py-2 rounded-lg text-sm border border-line bg-white"
        />
      </div>
      {filtered.length === 0 && <div className="text-center py-16 text-sm text-muted">Belum ada pesanan.</div>}
      <div className="flex flex-col gap-3">
        {filtered.map((b) => {
          const m = motors[b.motor_id];
          const br = branches[b.branch_id];
          return (
            <div key={b.id} className="rounded-xl p-4 flex flex-wrap justify-between gap-3 bg-white border border-line">
              <div>
                <div className="font-semibold text-sm text-ink">{m?.name} <span className="font-normal text-xs text-muted">({m?.plate})</span></div>
                <div className="text-xs flex items-center gap-1 mt-1 text-muted"><MapPin size={12} /> {br?.name}</div>
                <div className="text-xs flex items-center gap-1 mt-0.5 text-muted"><Calendar size={12} /> {b.start_date} &rarr; {b.end_date} ({b.days} hari)</div>
                <div className="text-xs mt-1 text-muted">Atas nama {b.customer_name}</div>
              </div>
              <div className="text-right flex flex-col items-end gap-1">
                <Badge tone={b.status}>{b.status}</Badge>
                <div className="font-bold text-sm text-ink">{fmt(b.total)}</div>
                {b.promo_code && <div className="text-[11px]" style={{ color: "#2FA88C" }}>promo {b.promo_code}</div>}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
