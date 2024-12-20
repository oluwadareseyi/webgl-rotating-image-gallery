export function lerp(p1, p2, t) {
  return p1 + (p2 - p1) * t;
}

export function easeInOut(t) {
  return t < 0.5 ? 4 * t * t * t : (t - 1) * (2 * t - 2) * (2 * t - 2) + 1;
}

export function interpolate(start, end, value) {
  return start * (1.0 - value) + end * value;
}

export function clamp(min, max, number) {
  return Math.max(min, Math.min(number, max));
}

export function random(min, max) {
  return Math.random() * (max - min) + min;
}

export function map(num, min1, max1, min2, max2, round = false) {
  const num1 = (num - min1) / (max1 - min1);
  const num2 = num1 * (max2 - min2) + min2;

  if (round) return Math.round(num2);

  return num2;
}
