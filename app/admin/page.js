"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { fmt } from "@/lib/helpers";
import { Bike, Check, Navigation, TrendingUp } from "lucide-react";

function MetricCard({ label, value, icon: Icon, tone }) {
  return (
    <div className="rounded-xl p-4 bg-white border border-line">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs text-muted">{label}</span>
        <Icon size={16} color={tone || "#8A8577"} />
      </div>
      <div className="text-xl font-bold text-ink">{value}</div>
    </div>
  );
}

export default function AdminDashboard() {
  const [motors, setMotors] = useState([]);
  const [branches, setBranches] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const [{ data: mt }, { data: br }, { data: bk }] = await Promise.all([
        supabase.from("motors").select("*"),
        supabase.from("branches").select("*"),
        supabase.from("bookings").select("*"),
      ]);
      setMotors(mt || []);
      setBranches(br || []);
      setBookings(bk || []);
      setLoading(false);
    })();
  }, []);

  if (loading) return <div className="text-center py-16 text-sm text-muted">Memuat...</div>;

  const tersedia = motors.filter((m) => m.status === "tersedia").length;
  const disewa = motors.filter((m) => m.status === "disewa").length;
  const revenue = bookings.reduce((s, b) => s + Number(b.total), 0);

  const perBranch = branches.map((b) => {
    const count = motors.filter((m) => m.branch_id === b.id).length;
    const rev = bookings.filter((bk) => bk.branch_id === b.id).reduce((s, x) => s + Number(x.total), 0);
    return { ...b, count, rev };
  });

  return (
    <div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        <MetricCard label="Total motor" value={motors.length} icon={Bike} />
        <MetricCard label="Tersedia" value={tersedia} icon={Check} tone="#2FA88C" />
        <MetricCard label="Sedang disewa" value={disewa} icon={Navigation} tone="#FF7A30" />
        <MetricCard label="Total pendapatan" value={fmt(revenue)} icon={TrendingUp} tone="#FF7A30" />
      </div>
      <div className="font-medium text-sm mb-2 text-ink">Ringkasan per cabang</div>
      <div className="grid md:grid-cols-3 gap-3">
        {perBranch.map((b) => (
          <div key={b.id} className="rounded-xl p-4 bg-white border border-line">
            <div className="font-semibold text-sm mb-1 text-ink">{b.name}</div>
            <div className="text-xs mb-2 text-muted">{b.count} unit motor</div>
            <div className="font-bold text-sm" style={{ color: "#FF7A30" }}>{fmt(b.rev)}</div>
            <div className="text-[11px] text-muted">pendapatan tercatat</div>
          </div>
        ))}
      </div>
    </div>
  );
}
