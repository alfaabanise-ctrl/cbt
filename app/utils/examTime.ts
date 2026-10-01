const DEFAULT_EXAM_DURATION_SECONDS = 2 * 60 * 60

export function durationToSeconds(
  value: unknown,
  fallback = DEFAULT_EXAM_DURATION_SECONDS
): number {
  if (typeof value === "number") {
    return Number.isFinite(value) && value >= 0
      ? Math.floor(value)
      : fallback
  }

  if (typeof value !== "string") {
    return fallback
  }

  const parts = value.trim().split(":")
  if (parts.length < 1 || parts.length > 3) {
    return fallback
  }

  const values = parts.map((part) =>
    /^\d+$/.test(part) ? Number(part) : Number.NaN
  )
  if (values.some((part) => !Number.isFinite(part))) {
    return fallback
  }

  let seconds: number
  if (values.length === 3) {
    const [hours, minutes, remainder] = values
    if (minutes > 59 || remainder > 59) return fallback
    seconds = hours * 3600 + minutes * 60 + remainder
  } else if (values.length === 2) {
    const [hours, minutes] = values
    if (minutes > 59) return fallback
    seconds = hours * 3600 + minutes * 60
  } else {
    seconds = values[0]
  }

  return Number.isSafeInteger(seconds) ? seconds : fallback
}

export function secondsToDuration(value: unknown): string {
  const seconds = typeof value === "number" && Number.isFinite(value)
    ? Math.max(0, Math.floor(value))
    : 0
  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  const remainder = seconds % 60

  return [hours, minutes, remainder]
    .map((part) => String(part).padStart(2, "0"))
    .join(":")
}

export function formatDurationLabel(value: unknown): string {
  const seconds = durationToSeconds(value)
  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)

  return `${String(hours).padStart(2, "0")} hr ${String(minutes).padStart(2, "0")} min`
}
