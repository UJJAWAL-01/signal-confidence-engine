export function volumeBreakout(volumes: number[], lookback = 20) {
  if (volumes.length < lookback + 1) return false;

  const recent = volumes.slice(-lookback);
  const avg =
    recent.reduce((a, b) => a + b, 0) / recent.length;

  const current = volumes[volumes.length - 1];

  return current >= avg * 1.5;
}
