export function normalizeColorValue(input?: string | null): string | null {
  if (!input) return null;

  const trimmed = input.trim().toLowerCase();

  if (/^#([0-9a-f]{3}|[0-9a-f]{6})$/i.test(trimmed)) {
    return trimmed;
  }

  const colorMap: Record<string, string> = {
    black: "#000000",
    white: "#ffffff",
    red: "#ff0000",
    green: "#008000",
    blue: "#0000ff",
    yellow: "#ffff00",
    orange: "#ffa500",
    purple: "#800080",
    pink: "#ffc0cb",
    gray: "#808080",
    grey: "#808080",
    brown: "#a52a2a",
    navy: "#000080",
    teal: "#008080",
    lime: "#00ff00",
    cyan: "#00ffff",
    magenta: "#ff00ff",
    silver: "#c0c0c0",
    gold: "#ffd700",
  };

  return colorMap[trimmed] || null;
}
