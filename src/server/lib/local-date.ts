import * as Environment from "./environment"

export function getOffset(): number {
  return Environment.getUtcOffset()
}

export function isDate(date: string | Date): boolean {
  if (typeof(date) === "string") {
    return (new Date(date).toString() !== "Invalid Date") ? true : false
  } else if (date instanceof Date) {
    return (date.toString() !== "Invalid Date") ? true : false
  } else {
    return false
  }
}

export function shiftDate(date: string | Date, future: boolean, day: number = 0, hour: number = 0, minute: number = 0, second: number = 0): string {
  if (!isDate(date)) {
    return null
  }

  const at = new Date(date)
  const direction = (future) ? 1 : -1
  if (day > 0) {
    at.setDate(at.getDate() + direction * day)
  }
  if (hour > 0 && hour < 24) {
    at.setHours(at.getHours() + direction * hour)
  }
  if (minute > 0 && minute < 60) {
    at.setMinutes(at.getMinutes() + direction * minute)
  }
  if (second > 0 && second < 60) {
    at.setSeconds(at.getSeconds() + direction * second)
  }

  return at.toISOString()
}

export function localize(date: string | Date, offset: number = getOffset()): string {
  if (!isDate(date)) {
    return null
  }

  if (offset === 0) {
    return new Date(date).toISOString()
  }

  const direction = (offset > 0)
  const sign   = direction ? "+"    : "-"
  const scalar = direction ? offset : -offset
  return shiftDate(date, direction, 0, scalar).replace("Z", sign) + scalar.toString().padStart(2, '0') + ":00"

}

export function now(local: boolean = false, offset: number = getOffset()): string {
  const now = new Date()
  return localize(now, local ? offset : 0)
}

export function toInputFormat(date: string | Date, local: boolean = false, offset: number = getOffset()): string {
  if (!isDate(date)) {
    return null
  }

  return localize(date, local ? offset : 0).slice(0, 19)
}

export function fromInputFormat(date: string, local: boolean = false, offset: number = getOffset()): string {
  if (!isDate(date)) {
    return null
  }

  if (local) {
    return new Date(date).toISOString()
  } else {
    const at = new Date(date)
    at.setHours(at.getHours() + offset)
    return at.toISOString()
  }
}
