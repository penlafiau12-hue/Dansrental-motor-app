"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { BranchTrackingCard } from "@/components/TrackingMap";
import { Building2 } from "lucide-react";

export default function AdminGpsPage() {
  const [branches, setBranches] = useState([]);
  const [motors, setMotors] = useState([]);
  const [latestPositions, setLatestPositions] = useState({});
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    const [{ data: br }, { data: mt }, { data: gps }] = await Promise.all([
      supabase.from("branches").select("*").order("name"),
      supabase.from("motors").select("*"),
      supabase.from("gps_positions").select("*").order("recorded_at", { ascending: false }).limit(500),
    ]);
    setBranches(br || []);
    setMotors(mt || []);
    setSelected((prev) => prev || br?.[0]?.id);
    const latest = {};
    (gps || []).forEach((g) => { if (!latest[g.motor_id]) latest[g.motor_id] = g; });
    setLatestPositions(latest);
    setLoading(false);
  };

  useEffect(() => {
    load();
    const interval = setInterval(load, 8000);
    return () => clearInterval(interval);
  }, []);

  if (loading) return <div className="text-center py-16 text-sm text-muted">Memuat...</div>;
  const branch = branches.find((b) => b.id === selected);

  return (
    <div>
      <p className="text-xs mb-4 text-muted">
        Data ini otomatis terisi asli jika hardware GPS tracker sudah dipasang dan mengirim data ke endpoint <code>/api/gps/ingest</code>. Sebelum itu, posisi yang tampil adalah contoh.
      </p>
      <div className="flex flex-wrap gap-2 mb-4">
        {branches.map((b) => (
          <button
            key={b.id}
            onClick={() => setSelected(b.id)}
            className={"px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 " + (selected === b.id ? "bg-ink text-paper" : "bg-white text-muted border border-line")}
          >
            <Building2 size={12} /> {b.name}
          </button>
        ))}
      </div>
      {branch && <BranchTrackingCard branch={branch} motors={motors} latestPositions={latestPositions} />}
    </div>
  );
}
