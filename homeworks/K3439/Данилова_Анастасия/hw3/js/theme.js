// подключается в <head>, чтобы страница не мигала белым при загрузке
const darkMedia = window.matchMedia('(prefers-color-scheme: dark)')

function getTheme() {
  return localStorage.getItem('theme') || (darkMedia.matches ? 'dark' : 'light')
}

function applyTheme(theme) {
  document.documentElement.setAttribute('data-theme', theme)
  // bootstrap тоже умеет тёмную тему для своих компонентов (формы, модалки, таблицы)
  document.documentElement.setAttribute('data-bs-theme', theme)

  const btn = document.getElementById('theme-toggle')
  if (btn) {
    btn.textContent = theme === 'dark' ? 'Светлая тема' : 'Тёмная тема'
    btn.setAttribute('aria-pressed', theme === 'dark')
  }
}

applyTheme(getTheme())

// если пользователь ничего не выбирал — следим за системой
darkMedia.addEventListener('change', () => {
  if (!localStorage.getItem('theme')) applyTheme(getTheme())
})

document.addEventListener('DOMContentLoaded', () => {
  const btn = document.getElementById('theme-toggle')
  if (!btn) return

  applyTheme(getTheme())
  btn.addEventListener('click', () => {
    const next = getTheme() === 'dark' ? 'light' : 'dark'
    localStorage.setItem('theme', next)
    applyTheme(next)
  })
})
