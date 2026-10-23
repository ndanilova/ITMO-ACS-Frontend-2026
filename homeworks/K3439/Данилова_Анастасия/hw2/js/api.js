const API_URL = 'http://localhost:3000'

// обёртка над fetch: подставляет токен и разбирает ошибки
async function api(path, options = {}) {
  const headers = { 'Content-Type': 'application/json' }
  const token = localStorage.getItem('token')
  if (token) {
    headers.Authorization = 'Bearer ' + token
  }

  const res = await fetch(API_URL + path, { ...options, headers })

  // токен протух (json-server-auth выдаёт его на 1 час)
  if (res.status === 401 && token) {
    logout()
    return
  }

  const data = await res.json()
  if (!res.ok) {
    // json-server-auth возвращает ошибку просто строкой
    throw new Error(typeof data === 'string' ? data : 'Ошибка ' + res.status)
  }
  return data
}
