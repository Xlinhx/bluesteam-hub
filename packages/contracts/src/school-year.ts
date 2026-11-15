export function schoolYearStart(label: string): number | null {
  const years = label.trim().match(/^(\d{4})\s*[-–—/]\s*(\d{4})$/);
  if (!years || Number(years[2]) !== Number(years[1]) + 1) return null;
  return Number(years[1]);
}
