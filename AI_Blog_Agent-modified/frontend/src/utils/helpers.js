export const downloadBlob = (blob, filename) => {
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url; a.download = filename
  document.body.appendChild(a); a.click()
  document.body.removeChild(a); URL.revokeObjectURL(url)
}

export const scoreColour = (s) => {
  if (s == null) return 'text-gray-400'
  if (s >= 70) return 'text-emerald-500'
  if (s >= 45) return 'text-amber-500'
  return 'text-red-500'
}

export const scoreBg = (s) => {
  if (s == null) return 'bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400'
  if (s >= 70) return 'bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-900/20 dark:text-emerald-400 dark:border-emerald-800'
  if (s >= 45) return 'bg-amber-50 text-amber-700 border border-amber-200 dark:bg-amber-900/20 dark:text-amber-400 dark:border-amber-800'
  return 'bg-red-50 text-red-700 border border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800'
}

export const scoreLabel = (s) => {
  if (s == null) return 'N/A'
  if (s >= 70) return 'Good'
  if (s >= 45) return 'Needs Work'
  return 'Poor'
}

export const fleschLabel = (s) => {
  if (s == null || Number.isNaN(Number(s))) return null
  if (s >= 70) return { label: 'Easy', colour: 'text-emerald-500' }
  if (s >= 50) return { label: 'Moderate', colour: 'text-amber-500' }
  return { label: 'Difficult', colour: 'text-red-500' }
}

export const formatDate = (iso) => {
  if (!iso) return ''
  return new Date(iso).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
}

export const truncate = (str, n = 80) => !str ? '' : str.length > n ? str.slice(0, n) + '…' : str
