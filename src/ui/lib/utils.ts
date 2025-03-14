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
