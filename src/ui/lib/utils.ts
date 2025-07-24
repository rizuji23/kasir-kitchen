import clsx, { ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function convertRupiah(integer: string | null): string {
  if (integer === null || isNaN(Number(integer.replace(/\./g, "")))) {
    return "0";
  }

  const numberString = integer
    .toString()
    .replace(/\./g, "")
    .replace(/[^,\d]/g, "");
  const split = numberString.split(",");
  const sisa = split[0].length % 3;
  let rupiah = split[0].substr(0, sisa);
  const ribuan = split[0].substr(sisa).match(/\d{3}/gi);

  if (ribuan) {
    const separator = sisa ? "." : "";
    rupiah += separator + ribuan.join(".");
  }

  rupiah += split[1] !== undefined ? "," + split[1] : "";

  return rupiah;
}

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(amount);
}

export function formatDateTime(dateString: string) {
  return new Date(dateString).toLocaleString("id-ID", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function getStatusBadge(status: string) {
  const statusConfig = {
    NO_PROCESSED: { label: "Belum Diproses", variant: "secondary" as const },
    PROCESSING: { label: "Sedang Diproses", variant: "default" as const },
    COMPLETED: { label: "Selesai", variant: "default" as const },
    PAID: { label: "Lunas", variant: "default" as const },
    NO_STARTED: { label: "Belum Dimulai", variant: "secondary" as const },
  };

  return (
    statusConfig[status as keyof typeof statusConfig] || {
      label: status,
      variant: "secondary" as const,
    }
  );
}
