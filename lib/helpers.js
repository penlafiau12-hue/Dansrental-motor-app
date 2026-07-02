export const fmt = (n) => "Rp " + Math.round(n || 0).toLocaleString("id-ID");

export const daysBetween = (a, b) =>
  Math.max(1, Math.round((new Date(b) - new Date(a)) / 86400000));

export const statusColor = {
  tersedia: { bg: "#EAF3E7", fg: "#2FA88C" },
  disewa: { bg: "#FDECE2", fg: "#FF7A30" },
  servis: { bg: "#F1EFE8", fg: "#8A8577" },
  pending: { bg: "#F1EFE8", fg: "#8A8577" },
  dikonfirmasi: { bg: "#E6F1FB", fg: "#185FA5" },
  aktif: { bg: "#FDECE2", fg: "#FF7A30" },
  selesai: { bg: "#EAF3E7", fg: "#2FA88C" },
  dibatalkan: { bg: "#FCEBEB", fg: "#D64545" },
};
