"use client";
import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { fmt } from "@/lib/helpers";
import { Badge, Plate, Button } from "@/components/UI";
import { Bike, Search, MapPin, Fuel, ChevronRight } from "lucide-react";
import { useRouter } from "next/navigation";

export default function HomePage() {
  const router = useRouter();
  const [branches, setBranches] = useState([]);
  const [motors, setMotors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [branchFilter, setBranchFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [search, setSearch] = useState("");

  useEffect(() => {
    (async () => {
      const [{ data: br }, { data: mt }] = await Promise.all([
        supabase.from("branches").select("*").order("name"),
        supabase.from("motors").select("*").order("name"),
      ]);
      setBranches(br || []);
      setMotors(mt || []);
      setLoading(false);
    })();
  }, []);

  const filtered = useMemo(() => {
    return motors.filter((m) => {
      if (branchFilter !== "all" && m.branch_id !== branchFilter) return false;
      if (typeFilter !== "all" && m.type !== typeFilter) return false;
      if (search && !(m.name + m.brand).toLowerCase().includes(search.toLowerCase())) return false;
      return true;
    });
  }, [motors, branchFilter, typeFilter, search]);

  if (loading) return <div className="text-center py-16 text-sm text-muted">Memuat data motor...</div>;

  if (branches.length === 0) {
    return (
      <div className="text-center py-16 text-sm text-muted max-w-md mx-auto">
        Belum ada data cabang/motor. Pastikan kamu sudah menjalankan <code>supabase/schema.sql</code> di Supabase Dashboard, dan file <code>.env.local</code> sudah diisi dengan benar.
      </div>
    );
  }

  return (
    <div>
      <div className="flex flex-wrap gap-2 mb-4">
        <div className="flex items-center gap-2 px-3 py-2 rounded-lg flex-1 min-w-[200px] bg-white border border-line">
          <Search size={15} className="text-muted" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari nama/merk motor..."
            className="w-full outline-none text-sm bg-transparent"
          />
        </div>
        <select value={branchFilter} onChange={(e) => setBranchFilter(e.target.value)} className="px-3 py-2 rounded-lg text-sm border border-line bg-white">
          <option value="all">Semua Cabang</option>
          {branches.map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}
        </select>
        <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)} className="px-3 py-2 rounded-lg text-sm border border-line bg-white">
          <option value="all">Semua Tipe</option>
          <option value="Matic">Matic</option>
          <option value="Sport">Sport</option>
          <option value="Bebek">Bebek</option>
        </select>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {filtered.map((m) => {
          const branch = branches.find((b) => b.id === m.branch_id);
          return (
            <div key={m.id} className="rounded-xl p-4 flex flex-col gap-2 bg-white border border-line">
              <div className="flex justify-between items-start">
                <div className="w-14 h-14 rounded-lg flex items-center justify-center bg-paper">
                  <Bike size={26} className="text-ink" />
                </div>
                <Badge tone={m.status}>{m.status}</Badge>
              </div>
              <div>
                <div className="font-semibold text-sm text-ink">{m.name}</div>
                <div className="text-xs flex items-center gap-1 text-muted"><Fuel size={12} /> {m.cc}cc &middot; {m.type}</div>
              </div>
              <Plate text={m.plate} />
              <div className="text-xs flex items-center gap-1 text-muted"><MapPin size={12} /> {branch?.name}</div>
              <div className="flex items-center justify-between mt-1">
                <div className="font-bold text-sm text-ink">{fmt(m.price)}<span className="font-normal text-xs text-muted">/hari</span></div>
                <Button
                  variant="primary"
                  disabled={m.status !== "tersedia"}
                  onClick={() => router.push(`/booking/${m.id}`)}
                  className="flex items-center gap-1"
                >
                  Sewa <ChevronRight size={12} />
                </Button>
              </div>
            </div>
          );
        })}
        {filtered.length === 0 && (
          <div className="col-span-full text-center py-10 text-sm text-muted">Tidak ada motor yang cocok.</div>
        )}
      </div>
    </div>
  );
}
