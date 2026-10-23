requireAuth()

const user = getUser()

function renderUserCard() {
  document.getElementById('user-card').innerHTML = `
    <img src="${user.avatar}" class="rounded-circle mb-2" width="100" height="100" alt="">
    <h2 class="h5 mb-0">${escapeHtml(user.firstName)} ${escapeHtml(user.lastName)}</h2>
    <p class="text-muted small mb-0">${escapeHtml(user.email)}</p>`
}

async function loadMyRentals() {
  const rentals = await api(`/rentals?userId=${user.id}&_expand=property&_sort=createdAt&_order=desc`)
  const tbody = document.getElementById('my-rentals')

  if (!rentals.length) {
    tbody.innerHTML = '<tr><td colspan="4" class="text-muted">Вы пока ничего не арендовали</td></tr>'
    return
  }

  tbody.innerHTML = rentals.map(r => `
    <tr>
      <td><a href="property.html?id=${r.propertyId}">${escapeHtml(r.property.title)}</a></td>
      <td>${formatDate(r.startDate)} — ${formatDate(r.endDate)}</td>
      <td>${formatPrice(r.totalPrice)}</td>
      <td>${statusBadge(r.status)}</td>
    </tr>`).join('')
}

async function loadMyProperties() {
  const properties = await api(`/properties?userId=${user.id}`)
  const el = document.getElementById('my-properties')

  if (!properties.length) {
    el.innerHTML = '<p class="text-muted">У вас нет объявлений</p>'
    return
  }

  el.innerHTML = properties.map(p => `
    <a href="property.html?id=${p.id}" class="list-group-item list-group-item-action d-flex justify-content-between align-items-center">
      <div>
        <b>${escapeHtml(p.title)}</b><br>
        <small class="text-muted">${formatPrice(p.pricePerMonth)} / мес · ${escapeHtml(p.city)}</small>
      </div>
      <span class="badge ${p.isAvailable ? 'text-bg-light' : 'text-bg-info'}">${p.isAvailable ? 'Свободен' : 'Сдан'}</span>
    </a>`).join('')
}

// заявки от арендаторов, владелец может одобрить или отклонить
async function loadRequests() {
  const rentals = await api(`/rentals?landlordId=${user.id}&_expand=property&_sort=createdAt&_order=desc`)
  const el = document.getElementById('requests')

  if (!rentals.length) {
    el.innerHTML = '<p class="text-muted">Заявок нет</p>'
    return
  }

  el.innerHTML = rentals.map(r => `
    <div class="list-group-item d-flex justify-content-between align-items-center">
      <div>
        <b>${escapeHtml(r.property.title)}</b><br>
        <small class="text-muted">${formatDate(r.startDate)} — ${formatDate(r.endDate)} · ${formatPrice(r.totalPrice)}</small>
      </div>
      <div>
        ${r.status === 'PENDING'
          ? `<button class="btn btn-sm btn-success" data-id="${r.id}" data-status="APPROVED">Одобрить</button>
             <button class="btn btn-sm btn-outline-danger" data-id="${r.id}" data-status="REJECTED">Отклонить</button>`
          : statusBadge(r.status)}
      </div>
    </div>`).join('')
}

document.getElementById('requests').addEventListener('click', async (e) => {
  const btn = e.target.closest('button[data-id]')
  if (!btn) return

  await api('/rentals/' + btn.dataset.id, {
    method: 'PATCH',
    body: JSON.stringify({ status: btn.dataset.status })
  })
  loadRequests()
})

// добавление объекта
const addForm = document.getElementById('add-form')

addForm.addEventListener('submit', async (e) => {
  e.preventDefault()
  const price = Number(addForm.price.value)
  const seed = Date.now() // картинки пока случайные

  await api('/properties', {
    method: 'POST',
    body: JSON.stringify({
      userId: user.id,
      ownerName: user.firstName + ' ' + user.lastName,
      title: addForm.title.value,
      type: addForm.type.value,
      city: addForm.city.value,
      address: addForm.address.value,
      pricePerMonth: price,
      description: addForm.description.value,
      images: [`https://picsum.photos/seed/${seed}/900/600`],
      amenities: addForm.amenities.value.split(',').map(a => a.trim()).filter(Boolean),
      minTerm: 1,
      deposit: price,
      utilitiesIncluded: false,
      petsAllowed: false,
      isAvailable: true
    })
  })

  bootstrap.Modal.getInstance(document.getElementById('addModal')).hide()
  addForm.reset()
  loadMyProperties()
})

renderUserCard()
loadMyRentals()
loadMyProperties()
loadRequests()
