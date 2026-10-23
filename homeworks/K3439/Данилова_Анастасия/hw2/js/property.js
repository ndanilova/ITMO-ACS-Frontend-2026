const propertyId = new URLSearchParams(window.location.search).get('id')
const container = document.getElementById('property')
let property = null

function renderProperty(p) {
  const user = getUser()
  const isOwner = user && user.id === p.userId

  const slides = p.images.map((img, i) => `
    <div class="carousel-item ${i === 0 ? 'active' : ''}">
      <img src="${img}" class="d-block w-100" alt="Фото ${i + 1} из ${p.images.length}: ${escapeHtml(p.title)}">
    </div>`).join('')

  let buttons = ''
  if (isOwner) {
    buttons = '<p class="text-muted">Это ваше объявление</p>'
  } else if (!p.isAvailable) {
    buttons = '<button class="btn btn-secondary w-100" disabled>Сейчас сдано</button>'
  } else {
    buttons = `
      <button class="btn btn-primary w-100" id="book-btn">Арендовать</button>
      <button class="btn btn-outline-secondary w-100 mt-2" id="chat-btn">Написать владельцу</button>`
  }

  container.innerHTML = `
    <div class="row g-4">
      <div class="col-lg-7">
        <div id="photos" class="carousel slide" aria-label="Фотографии объекта">
          <div class="carousel-inner rounded">${slides}</div>
          <button class="carousel-control-prev" type="button" data-bs-target="#photos" data-bs-slide="prev">
            <span class="carousel-control-prev-icon" aria-hidden="true"></span>
            <span class="visually-hidden">Предыдущее фото</span>
          </button>
          <button class="carousel-control-next" type="button" data-bs-target="#photos" data-bs-slide="next">
            <span class="carousel-control-next-icon" aria-hidden="true"></span>
            <span class="visually-hidden">Следующее фото</span>
          </button>
        </div>

        <h2 class="h4 mt-4">Описание</h2>
        <p>${escapeHtml(p.description)}</p>

        <h2 class="h4 mt-4">Удобства</h2>
        <ul>${p.amenities.map(a => `<li>${escapeHtml(a)}</li>`).join('')}</ul>
      </div>

      <div class="col-lg-5">
        <div class="bg-white p-4 rounded">
          <span class="badge text-bg-light">${TYPE_NAMES[p.type]}</span>
          <h1 class="h3 mt-2">${escapeHtml(p.title)}</h1>
          <p class="text-muted">${escapeHtml(p.city)}, ${escapeHtml(p.address)}</p>
          <p class="price fs-3">${formatPrice(p.pricePerMonth)} / мес</p>

          <h2 class="h6 mt-3">Условия аренды</h2>
          <ul class="list-unstyled small">
            <li>Срок: от ${p.minTerm} мес.</li>
            <li>Залог: ${formatPrice(p.deposit)}</li>
            <li>Коммунальные услуги ${p.utilitiesIncluded ? 'включены' : 'оплачиваются отдельно'}</li>
            <li>${p.petsAllowed ? 'Можно с животными' : 'Без животных'}</li>
          </ul>

          ${buttons}

          <hr>
          <p class="mb-0 small">Владелец: <b>${escapeHtml(p.ownerName)}</b></p>
        </div>
      </div>
    </div>`

  const bookBtn = document.getElementById('book-btn')
  if (bookBtn) {
    bookBtn.addEventListener('click', () => {
      if (!isLoggedIn()) return (window.location.href = 'login.html')
      bootstrap.Modal.getOrCreateInstance(document.getElementById('bookModal')).show()
    })
    document.getElementById('chat-btn').addEventListener('click', openChat)
  }
}

async function loadProperty() {
  try {
    property = await api('/properties/' + propertyId)
    document.title = property.title + ' — Snimu'
    renderProperty(property)
  } catch (err) {
    container.innerHTML = '<div class="alert alert-danger" role="alert">Объект не найден</div>'
  }
}

// ищем чат с владельцем по этому объекту, если нет — создаём
async function openChat() {
  if (!isLoggedIn()) return (window.location.href = 'login.html')
  const user = getUser()

  let chats = await api(`/chats?propertyId=${property.id}&tenantId=${user.id}`)
  let chat = chats[0]
  if (!chat) {
    chat = await api('/chats', {
      method: 'POST',
      body: JSON.stringify({
        propertyId: property.id,
        tenantId: user.id,
        tenantName: user.firstName + ' ' + user.lastName,
        landlordId: property.userId,
        landlordName: property.ownerName
      })
    })
  }
  window.location.href = 'messages.html?chat=' + chat.id
}

// --- бронирование ---
const bookForm = document.getElementById('book-form')

function calcTotal() {
  const start = new Date(bookForm.start.value)
  const end = new Date(bookForm.end.value)
  if (!bookForm.start.value || !bookForm.end.value || end <= start) return 0
  const days = (end - start) / (1000 * 60 * 60 * 24)
  return Math.round(days / 30 * property.pricePerMonth)
}

bookForm.addEventListener('change', () => {
  const total = calcTotal()
  document.getElementById('total').textContent = total ? formatPrice(total) : '—'
})

bookForm.addEventListener('submit', async (e) => {
  e.preventDefault()
  const errorEl = document.getElementById('book-error')
  errorEl.classList.add('d-none')

  const total = calcTotal()
  if (!total) {
    errorEl.textContent = 'Дата выезда должна быть позже даты заезда'
    errorEl.classList.remove('d-none')
    return
  }

  try {
    await api('/rentals', {
      method: 'POST',
      body: JSON.stringify({
        propertyId: property.id,
        userId: getUser().id,
        landlordId: property.userId,
        startDate: bookForm.start.value,
        endDate: bookForm.end.value,
        totalPrice: total,
        status: 'PENDING',
        createdAt: new Date().toISOString()
      })
    })
    bootstrap.Modal.getInstance(document.getElementById('bookModal')).hide()
    alert('Заявка отправлена! Статус можно посмотреть в личном кабинете.')
    bookForm.reset()
  } catch (err) {
    errorEl.textContent = err.message
    errorEl.classList.remove('d-none')
  }
})

loadProperty()
