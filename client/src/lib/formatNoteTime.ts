export function formatNoteTime(date: Date, includeLabel = true): string {
  const now = new Date()

  const startOfDay = (d: Date) =>
    new Date(d.getFullYear(), d.getMonth(), d.getDate())

  const dateDay = startOfDay(date)
  const todayDay = startOfDay(now)

  const msPerDay = 24 * 60 * 60 * 1000
  const dayDiff = Math.round(
    (todayDay.getTime() - dateDay.getTime()) / msPerDay
  )

  if (dayDiff === 0) {
    return (
      date.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' }) +
      (includeLabel ? ` today` : '')
    )
  }
  if (dayDiff === 1) {
    return 'Yesterday'
  }
  return date.toLocaleDateString()
}
