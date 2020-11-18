import * as Environment from "./environment"

const HOUR_MS = 60 * 60 * 1000

export function now(offset: number = Environment.getUtcOffset()): Date {
  const now = new Date()
  now.setTime(now.getTime() + offset * HOUR_MS)
  return now
}

export function newDate(str: string, offset: number = Environment.getUtcOffset()): Date {
  const date = new Date(str)
  if (date.toString() !== "Invalid Date") {
    date.setTime(date.getTime() + offset * HOUR_MS)
  }
  return date
}

export function toISOString(date: Date): string {
  return (date.toString() !== "Invalid Date") ? date.toISOString().slice(0, 19) : null
}
