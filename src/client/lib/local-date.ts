import Environment from "./environment"

const HOUR_MS = 60 * 60 * 1000

export default {
  now: (offset: number = Environment.getUtcOffset()) => {
    const now = new Date()
    now.setTime(now.getTime() + offset * HOUR_MS)
    return now
  },

  newDate: (str: string, offset: number = Environment.getUtcOffset()) => {
    const date = new Date(str)
    if (date.toString() !== "Invalid Date") {
      date.setTime(date.getTime() + offset * HOUR_MS)
    }
    return date
  },

  toISOString: (date: Date) => {
    if (date.toString() === "Invalid Date") {
      return null
    }
    return date.toISOString().slice(0, 19)
  }
}
