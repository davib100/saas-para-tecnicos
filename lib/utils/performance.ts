export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  wait: number,
): ((...args: Parameters<T>) => void) => {
  let timeout: NodeJS.Timeout | null = null

  return (...args: Parameters<T>) => {
    if (timeout) clearTimeout(timeout)
    timeout = setTimeout(() => func(...args), wait)
  }
}

export const throttle = <T extends (...args: any[]) => any>(
  func: T,
  limit: number,
): ((...args: Parameters<T>) => void) => {
  let inThrottle: boolean

  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args)
      inThrottle = true
      setTimeout(() => (inThrottle = false), limit)
    }
  }
}

export const memoize = <T extends (...args: any[]) => any>(fn: T): T => {
  const cache = new Map()

  return ((...args: Parameters<T>) => {
    const key = JSON.stringify(args)
    if (cache.has(key)) {
      return cache.get(key)
    }

    const result = fn(...args)
    cache.set(key, result)
    return result
  }) as T
}

export const formatCurrency = memoize((value: number): string => {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value)
})

export const formatDate = memoize((date: Date | string): string => {
  const dateObj = typeof date === "string" ? new Date(date) : date
  return new Intl.DateTimeFormat("pt-BR").format(dateObj)
})
