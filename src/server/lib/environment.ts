export function getUtcOffset(): number {
  return new Date().getTimezoneOffset() / -60
}

export function getTimeZone(): string {
  return Intl.DateTimeFormat().resolvedOptions().timeZone
}
