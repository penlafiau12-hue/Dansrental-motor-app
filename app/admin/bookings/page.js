"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { fmt } from "@/lib/helpers";
import { Badge } from "@/components/UI";

const nextStatus = { pending: "dikonfirmasi", dikonfirmasi: "aktif", aktif: "selesai" };

export default function AdminBookingsPage() {
  const [bookings, setBookings] = useState([]);
  const [motors, setMotors] = useState({});
  const [branches, setBranches] = useState({});
  const [loading, setLoading] = useState(true);

  const load = async () => {
    const [{ data: bk }, { data: mt }, { data: br }] = await Promise.all([
      supabase.from("bookings").select("*").order("created_at", { ascending: false }),
      supabase.from("motors").select("*"),
      supabase.from("branches").select("*"),
    ]);
    setBookings(bk || []);
    setMotors(Object.fromEntries((mt || []).map((m) => [m.id, m])));
    setBranches(Object.fromEntries((br || []).map((b) => [b.id, b])));
    setLoading(false);
  };
  useEffect(() => { load(); }, []);

  const setStatus = async (booking, status) => {
    await supabase.from("bookings").update({ status }).eq("id", booking.id);
    if (status === "selesai" || status === "dibatalkan") {
      await supabase.from("motors").update({ status: "tersedia" }).eq("id", booking.motor_id);
    }
    load();
  };

  if (loading) return <div className="text-center py-16 text-sm text-muted">Memuat...</div>;

  return (
    <div className="flex flex-col gap-2">
      {bookings.length === 0 && <div className="text-center py-10 text-sm text-muted">Belum ada pesanan masuk.</div>}
      {bookings.map((b) => {
        const m = motors[b.motor_id];
        const br = branches[b.branch_id];
        const next = nextStatus[b.status];
        return (
          <div key={b.id} className="rounded-xl p-4 flex flex-wrap justify-between gap-3 bg-white border border-line">
            <div>
              <div className="font-semibold text-sm text-ink">{b.customer_name} <span className="font-normal text-xs text-muted">&middot; {b.phone}</span></div>
              <div className="text-xs text-muted">{m?.name} ({m?.plate}) &middot; {br?.name}</div>
              <div className="text-xs text-muted">{b.start_date} &rarr; {b.end_date} ({b.days} hari)</div>
            </div>
            <div className="flex flex-col items-end gap-1.5">
              <Badge tone={b.status}>{b.status}</Badge>
              <div className="font-bold text-sm text-ink">{fmt(b.total)}</div>
              <div className="flex gap-1">
                {next && (
                  <button onClick={() => setStatus(b, next)} className="px-2 py-1 rounded-md text-[11px] font-medium text-white" style={{ background: "#2FA88C" }}>
                    Tandai {next}
                  </button>
                )}
                {b.status !== "dibatalkan" && b.status !== "selesai" && (
                  <button onClick={() => setStatus(b, "dibatalkan")} className="px-2 py-1 rounded-md text-[11px] font-medium text-white" style={{ background: "#D64545" }}>
                    Batalkan
                  </button>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
