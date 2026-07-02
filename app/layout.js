import "./globals.css";
import Link from "next/link";
import { Bike } from "lucide-react";

export const metadata = {
  title: "RentMotor - Sewa Motor Multi Cabang",
  description: "Aplikasi rental motor dengan booking online, promo, dan lacak GPS",
};

export default function RootLayout({ children }) {
  return (
    <html lang="id">
      <body>
        <div className="border-b border-line bg-white">
          <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between flex-wrap gap-3">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-lg flex items-center justify-center bg-ink">
                <Bike size={18} color="#F5C518" />
              </div>
              <div>
                <div className="font-bold text-base leading-none text-ink">RentMotor</div>
                <div className="text-[11px] text-muted">Sewa motor multi-cabang</div>
              </div>
            </Link>
            <nav className="flex items-center gap-1 p-1 rounded-lg bg-paper text-sm">
              <Link href="/" className="px-3 py-1.5 rounded-md font-medium text-muted hover:text-ink">Cari Motor</Link>
              <Link href="/orders" className="px-3 py-1.5 rounded-md font-medium text-muted hover:text-ink">Pesanan Saya</Link>
              <Link href="/tracking" className="px-3 py-1.5 rounded-md font-medium text-muted hover:text-ink">Lacak Motor</Link>
              <Link href="/admin" className="px-3 py-1.5 rounded-md font-medium text-muted hover:text-ink">Admin</Link>
            </nav>
          </div>
        </div>
        <div className="max-w-6xl mx-auto px-4 py-6">{children}</div>
      </body>
    </html>
  );
}
