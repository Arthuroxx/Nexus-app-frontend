export function formatVolumeKg(volumeKg: number, locale = 'es-ES'): string {
  return `${volumeKg.toLocaleString(locale, { maximumFractionDigits: 1 })} kg`;
}

export function formatSessionDate(iso: string, locale = 'es-ES'): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) {
    return '';
  }
  return date.toLocaleDateString(locale, {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  });
}
