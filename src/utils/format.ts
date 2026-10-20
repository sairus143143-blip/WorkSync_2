export function initials(name: string): string {
  return name.
  split(' ').
  filter((part) => /^\p{L}/u.test(part)).
  slice(0, 2).
  map((part) => part.charAt(0).toUpperCase()).
  join('');
}

export function firstName(name: string): string {
  return name.split(' ')[0] ?? name;
}

export function greeting(date: Date = new Date()): string {
  const hour = date.getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 18) return 'Good afternoon';
  return 'Good evening';
}