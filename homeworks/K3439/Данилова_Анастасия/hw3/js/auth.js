function getUser() {
  const user = localStorage.getItem('user')
  return user ? JSON.parse(user) : null
}

function isLoggedIn() {
  return !!localStorage.getItem('token')
}

function saveAuth(data) {
  localStorage.setItem('token', data.accessToken)
  localStorage.setItem('user', JSON.stringify(data.user))
}

function logout() {
  localStorage.removeItem('token')
  localStorage.removeItem('user')
  window.location.href = 'login.html'
}

// для страниц, куда без входа нельзя
function requireAuth() {
  if (!isLoggedIn()) {
    window.location.href = 'login.html'
  }
}

async function login(email, password) {
  const data = await api('/login', {
    method: 'POST',
    body: JSON.stringify({ email, password })
  })
  saveAuth(data)
}

async function register(user) {
  const data = await api('/register', {
    method: 'POST',
    body: JSON.stringify(user)
  })
  saveAuth(data)
}

// в шапке показываем либо "Войти", либо имя и "Выйти"
function renderNav() {
  const el = document.getElementById('nav-auth')
  if (!el) return

  const user = getUser()
  if (user) {
    el.innerHTML = `<a class="nav-link" href="#" id="logout-link">Выйти (${escapeHtml(user.firstName)})</a>`
    document.getElementById('logout-link').addEventListener('click', (e) => {
      e.preventDefault()
      logout()
    })
  } else {
    el.innerHTML = '<a class="nav-link" href="login.html">Войти</a>'
  }
}

document.addEventListener('DOMContentLoaded', renderNav)
