// фильтрация объектов на странице поиска
const filtersForm = document.getElementById('filters')

function applyFilters() {
  const type = filtersForm.type.value
  const city = filtersForm.city.value.trim().toLowerCase()
  const priceFrom = Number(filtersForm.priceFrom.value) || 0
  const priceTo = Number(filtersForm.priceTo.value) || Infinity

  const cols = document.querySelectorAll('.property-col')
  let count = 0

  cols.forEach(col => {
    const price = Number(col.dataset.price)
    let show = true

    if (type && col.dataset.type !== type) show = false
    if (city && !col.dataset.city.toLowerCase().includes(city)) show = false
    if (price < priceFrom || price > priceTo) show = false

    col.style.display = show ? '' : 'none'
    if (show) count++
  })

  document.getElementById('found-count').textContent = 'Найдено объектов: ' + count
}

if (filtersForm) {
  filtersForm.addEventListener('submit', (e) => {
    e.preventDefault()
    applyFilters()
  })
  filtersForm.addEventListener('reset', () => {
    setTimeout(applyFilters, 0) // иначе значения ещё не сбросились
  })
  applyFilters()
}

// форма бронирования в модалке
const bookForm = document.getElementById('book-form')
const PRICE_PER_MONTH = 35000

if (bookForm) {
  bookForm.addEventListener('change', () => {
    const start = new Date(bookForm.start.value)
    const end = new Date(bookForm.end.value)
    if (bookForm.start.value && bookForm.end.value && end > start) {
      const days = (end - start) / (1000 * 60 * 60 * 24)
      const total = Math.round(days / 30 * PRICE_PER_MONTH)
      document.getElementById('total').textContent = total + ' ₽'
    } else {
      document.getElementById('total').textContent = '—'
    }
  })

  bookForm.addEventListener('submit', (e) => {
    e.preventDefault()
    alert('Заявка отправлена! Владелец свяжется с вами.')
    bootstrap.Modal.getInstance(document.getElementById('bookModal')).hide()
    bookForm.reset()
  })
}

// отправка сообщения в чате
const sendForm = document.getElementById('send-form')

if (sendForm) {
  sendForm.addEventListener('submit', (e) => {
    e.preventDefault()
    const text = sendForm.text.value.trim()
    if (!text) return

    const div = document.createElement('div')
    div.className = 'msg'
    div.textContent = text
    document.getElementById('messages').appendChild(div)
    sendForm.reset()
  })
}

// вход / регистрация
const authForm = document.getElementById('login-form') || document.getElementById('register-form')

if (authForm) {
  authForm.addEventListener('submit', (e) => {
    e.preventDefault()
    window.location.href = 'profile.html'
  })
}
