"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { Field, Input, Button } from "@/components/UI";
import { Plus, Edit2 } from "lucide-react";

const blank = { name: "", city: "", address: "", phone: "", hours: "08:00 - 20:00", geofence: 120, lat: "", lng: "" };

export default function AdminBranchesPage() {
  const [branches, setBranches] = useState([]);
  const [editing, setEditing] = useState(null);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    const { data } = await supabase.from("branches").select("*").order("name");
    setBranches(data || []);
    setLoading(false);
  };
  useEffect(() => { load(); }, []);

  const save = async () => {
    const payload = { ...editing };
    const id = payload.id;
    delete payload.id;
    if (id) await supabase.from("branches").update(payload).eq("id", id);
    else await supabase.from("branches").insert(payload);
    setEditing(null);
    load();
  };

  if (loading) return <div className="text-center py-16 text-sm text-muted">Memuat...</div>;

  return (
    <div>
      <div className="flex justify-between items-center mb-3">
        <div className="font-medium text-sm text-ink">Data cabang ({branches.length})</div>
        <Button variant="primary" onClick={() => setEditing(blank)} className="flex items-center gap-1">
          <Plus size={13} /> Tambah cabang
        </Button>
      </div>

      {editing && (
        <div className="rounded-xl p-4 mb-3 bg-white" style={{ border: "1px solid #FF7A30" }}>
          <div className="grid md:grid-cols-2 gap-2">
            <Field label="Nama cabang"><Input value={editing.name} onChange={(e) => setEditing({ ...editing, name: e.target.value })} /></Field>
            <Field label="Kota"><Input value={editing.city} onChange={(e) => setEditing({ ...editing, city: e.target.value })} /></Field>
            <Field label="Alamat"><Input value={editing.address} onChange={(e) => setEditing({ ...editing, address: e.target.value })} /></Field>
            <Field label="No. telepon"><Input value={editing.phone} onChange={(e) => setEditing({ ...editing, phone: e.target.value })} /></Field>
            <Field label="Jam operasional"><Input value={editing.hours} onChange={(e) => setEditing({ ...editing, hours: e.target.value })} /></Field>
            <Field label="Radius geofence (meter)"><Input type="number" value={editing.geofence} onChange={(e) => setEditing({ ...editing, geofence: +e.target.value })} /></Field>
            <Field label="Latitude (opsional, untuk peta asli)"><Input value={editing.lat} onChange={(e) => setEditing({ ...editing, lat: e.target.value })} placeholder="-6.914744" /></Field>
            <Field label="Longitude (opsional, untuk peta asli)"><Input value={editing.lng} onChange={(e) => setEditing({ ...editing, lng: e.target.value })} placeholder="107.609810" /></Field>
          </div>
          <div className="flex gap-2 mt-3">
            <Button variant="accent" onClick={save}>Simpan</Button>
            <Button variant="ghost" onClick={() => setEditing(null)}>Batal</Button>
          </div>
        </div>
      )}

      <div className="grid md:grid-cols-2 gap-3">
        {branches.map((b) => (
          <div key={b.id} className="rounded-xl p-4 flex justify-between items-start bg-white border border-line">
            <div>
              <div className="font-semibold text-sm text-ink">{b.name}</div>
              <div className="text-xs text-muted">{b.address}, {b.city}</div>
              <div className="text-xs text-muted">{b.phone} &middot; {b.hours}</div>
              <div className="text-[11px] mt-1" style={{ color: "#FF7A30" }}>Geofence: {b.geofence} m</div>
            </div>
            <button onClick={() => setEditing(b)} className="p-1.5 rounded-lg bg-paper"><Edit2 size={13} /></button>
          </div>
        ))}
      </div>
    </div>
  );
}
