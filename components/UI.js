"use client";
import { statusColor } from "@/lib/helpers";

export function Badge({ children, tone = "tersedia" }) {
  const c = statusColor[tone] || statusColor.tersedia;
  return (
    <span
      className="text-xs font-medium px-2 py-1 rounded-full whitespace-nowrap"
      style={{ background: c.bg, color: c.fg }}
    >
      {children}
    </span>
  );
}

export function Plate({ text }) {
  return (
    <span
      className="inline-block px-2 py-0.5 text-xs font-bold tracking-wide rounded border-2 border-ink bg-plate text-ink"
      style={{ fontFamily: "monospace" }}
    >
      {text}
    </span>
  );
}

export function Field({ label, children }) {
  return (
    <div>
      <div className="text-xs mb-1 text-muted">{label}</div>
      {children}
    </div>
  );
}

export function Input(props) {
  return (
    <input
      {...props}
      className={
        "w-full px-2 py-1.5 rounded-lg text-sm border border-line focus:outline-none focus:border-accent " +
        (props.className || "")
      }
    />
  );
}

export function Select(props) {
  return (
    <select
      {...props}
      className={
        "w-full px-2 py-1.5 rounded-lg text-sm border border-line bg-white " +
        (props.className || "")
      }
    >
      {props.children}
    </select>
  );
}

export function Button({ children, variant = "primary", ...props }) {
  const styles = {
    primary: "bg-ink text-paper",
    accent: "bg-accent text-white",
    ghost: "bg-paper text-ink",
    danger: "bg-danger text-white",
  };
  return (
    <button
      {...props}
      className={
        "px-3 py-1.5 rounded-lg text-sm font-medium disabled:opacity-40 " +
        styles[variant] +
        " " +
        (props.className || "")
      }
    >
      {children}
    </button>
  );
}
