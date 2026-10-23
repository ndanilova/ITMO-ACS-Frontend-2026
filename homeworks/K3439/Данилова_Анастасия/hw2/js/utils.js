const TYPE_NAMES = {
  APARTMENT: 'Квартира',
  STUDIO: 'Студия',
  ROOM: 'Комната',
  HOUSE: 'Дом'
}

const STATUS_NAMES = {
  PENDING: ['На рассмотрении', 'warning'],
  APPROVED: ['Одобрена', 'primary'],
  REJECTED: ['Отклонена', 'danger'],
  ACTIVE: ['Активна', 'success'],
  COMPLETED: ['Завершена', 'secondary'],
  CANCELLED: ['Отменена', 'secondary']
}

function formatPrice(n) {
  return Number(n).toLocaleString('ru-RU') + ' ₽'
}

function formatDate(str) {
  return new Date(str).toLocaleDateString('ru-RU')
}

function statusBadge(status) {
  const [text, color] = STATUS_NAMES[status] || [status, 'light']
  return `<span class="badge text-bg-${color}">${text}</span>`
}

// чтобы пользователи не могли вставить html в объявление
function escapeHtml(str) {
  const div = document.createElement('div')
  div.textContent = str
  return div.innerHTML
}
