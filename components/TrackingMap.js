"use client";
import { Plate } from "@/components/UI";
import { Radio, AlertTriangle, Building2 } from "lucide-react";

// Menghasilkan offset semu yang konsisten dari id motor (dipakai HANYA jika
// belum ada data gps_positions asli dari hardware, sebagai placeholder visual).
function pseudoOffset(id) {
  let seed = 0;
  for (const ch of id) seed = (seed * 31 + ch.charCodeAt(0)) % 100000;
  const angle = (seed % 360) * (Math.PI / 180);
  const dist = 30 + (seed % 90);
  return { x: Math.cos(angle) * dist, y: Math.sin(angle) * dist };
}

export function RadarMap({ branch, motors, latestPositions }) {
  const size = 320;
  const c = size / 2;
  const scale = c / 180;
  if (!branch) return null;
  return (
    <svg viewBox={`0 0 ${size} ${size}`} width="100%" style={{ maxWidth: 380, display: "block", margin: "0 auto" }}>
      {[branch.geofence, branch.geofence * 0.66, branch.geofence * 0.33].map((r, i) => (
        <circle key={i} cx={c} cy={c} r={r * scale} fill="none" stroke="#E4DFD2" strokeWidth="1" strokeDasharray="4 3" />
      ))}
      <circle cx={c} cy={c} r={7} fill="#1C1F26" />
      <text x={c} y={c + 22} textAnchor="middle" fontSize="10" fill="#8A8577">{branch.name}</text>
      {motors.map((m) => {
        const real = latestPositions[m.id];
        const p = real ? { x: (real.lng - branch.lng || 0) * 100000, y: (real.lat - branch.lat || 0) * 100000 } : pseudoOffset(m.id);
        const dist = Math.sqrt(p.x * p.x + p.y * p.y);
        const out = dist > branch.geofence * 0.7;
        const x = c + Math.max(-170, Math.min(170, p.x)) * scale;
        const y = c + Math.max(-170, Math.min(170, p.y)) * scale;
        return (
          <g key={m.id}>
            <circle cx={x} cy={y} r={6} fill={out ? "#D64545" : "#FF7A30"} />
            <text x={x} y={y - 10} textAnchor="middle" fontSize="9" fill="#1C1F26" fontWeight="600">{m.plate.split(" ")[1] || m.plate}</text>
          </g>
        );
      })}
    </svg>
  );
}

export function BranchTrackingCard({ branch, motors, latestPositions }) {
  const branchMotors = motors.filter((m) => m.branch_id === branch.id && m.status === "disewa");
  return (
    <div className="grid md:grid-cols-[1fr_260px] gap-4">
      <div className="rounded-xl p-4 bg-white border border-line">
        <RadarMap branch={branch} motors={branchMotors} latestPositions={latestPositions} />
      </div>
      <div className="flex flex-col gap-2">
        {branchMotors.length === 0 && (
          <div className="text-xs p-4 rounded-xl text-center text-muted bg-white border border-line">
            Tidak ada motor aktif disewa di cabang ini saat ini.
          </div>
        )}
        {branchMotors.map((m) => {
          const real = latestPositions[m.id];
          return (
            <div key={m.id} className="rounded-xl p-3 bg-white border border-line">
              <div className="flex justify-between items-start">
                <div className="font-medium text-xs text-ink">{m.name}</div>
                <Radio size={12} color="#2FA88C" />
              </div>
              <Plate text={m.plate} />
              <div className="text-[11px] mt-1 text-muted">
                {real ? `Update: ${new Date(real.recorded_at).toLocaleTimeString("id-ID")}` : "Belum ada GPS tracker terpasang (posisi contoh)"}
              </div>
              {!m.gps_device_id && (
                <div className="text-[11px] flex items-center gap-1 mt-1" style={{ color: "#8A8577" }}>
                  <AlertTriangle size={11} /> ID perangkat GPS belum diisi di data motor
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
