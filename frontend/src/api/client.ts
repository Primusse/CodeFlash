const BASE = '/api'

/**
 * 统一的 fetch JSON 封装
 * 自动处理错误解析，抛出带 message 的 Error
 */
export async function fetchJSON<T>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}${url}`, options)
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: 'Network error' }))
    throw new Error(err.error || `HTTP ${res.status}`)
  }
  return res.json()
}

/**
 * 构造带 query 参数的 URL
 */
export function withQuery(url: string, params: Record<string, string | undefined>): string {
  const search = new URLSearchParams()
  Object.entries(params).forEach(([k, v]) => {
    if (v !== undefined && v !== '') search.append(k, v)
  })
  const qs = search.toString()
  return qs ? `${url}?${qs}` : url
}
