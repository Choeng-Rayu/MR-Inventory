import { Transform } from 'class-transformer';

export function sanitizeString(input: string): string {
  return input.replace(/[<>]/g, '').trim();
}

export function Sanitize() {
  return Transform(({ value }) => {
    if (typeof value === 'string') {
      return sanitizeString(value);
    }
    return value;
  });
}
