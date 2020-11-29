import Environment from "./environment"

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

export function localize(date: string | Date, offset: number = getOffset()): string {
  if (!isDate(date)) {
    return null
  }

  if (typeof(date) === "string") {
    if (offset === 0) {
      return new Date(date).toISOString()
    } else {
      const at = new Date(date)
      const sign   = (offset > 0) ? "+"    : "-"
      const scalar = (offset > 0) ? offset : -offset
      at.setHours(at.getHours() + offset)
      return at.toISOString().replace("Z", sign) + scalar.toString().padStart(2, '0') + ":00"
    }
  } else if (date instanceof Date) {
    if (offset === 0) {
      return date.toISOString()
    } else {
      const sign   = (offset > 0) ? "+"    : "-"
      const scalar = (offset > 0) ? offset : -offset
      date.setHours(date.getHours() + offset)
      return date.toISOString().replace("Z", sign) + scalar.toString().padStart(2, '0') + ":00"
    }
  }
}

export function nowDate(): Date {
  return new Date()
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
