const filtersForm = document.getElementById('filters')
const list = document.getElementById('properties')

function propertyCard(p) {
  return `
    <div class="col-md-6 col-lg-4">
      <div class="card h-100">
        <img src="${p.images[0]}" class="card-img-top" alt="">
        <div class="card-body">
          <span class="badge text-bg-light mb-2">${TYPE_NAMES[p.type]}</span>
          ${p.isAvailable ? '' : '<span class="badge text-bg-secondary mb-2">Сдано</span>'}
          <h5 class="card-title">${escapeHtml(p.title)}</h5>
          <p class="card-text text-muted mb-1">${escapeHtml(p.city)}, ${escapeHtml(p.address)}</p>
          <p class="price">${formatPrice(p.pricePerMonth)} / мес</p>
          <a href="property.html?id=${p.id}" class="btn btn-outline-primary btn-sm">Подробнее</a>
        </div>
      </div>
    </div>`
}

async function loadProperties() {
  // фильтры собираем в query для json-server
  const params = new URLSearchParams()
  if (filtersForm.type.value) params.append('type', filtersForm.type.value)
  if (filtersForm.city.value.trim()) params.append('city_like', filtersForm.city.value.trim())
  if (filtersForm.priceFrom.value) params.append('pricePerMonth_gte', filtersForm.priceFrom.value)
  if (filtersForm.priceTo.value) params.append('pricePerMonth_lte', filtersForm.priceTo.value)

  try {
    const properties = await api('/properties?' + params.toString())
    document.getElementById('found-count').textContent = 'Найдено объектов: ' + properties.length
    list.innerHTML = properties.length
      ? properties.map(propertyCard).join('')
      : '<p>Ничего не нашлось, попробуйте изменить фильтры</p>'
  } catch (err) {
    list.innerHTML = '<div class="alert alert-danger">Не удалось загрузить объекты. Сервер запущен?</div>'
  }
}

filtersForm.addEventListener('submit', (e) => {
  e.preventDefault()
  loadProperties()
})

filtersForm.addEventListener('reset', () => {
  setTimeout(loadProperties, 0)
})

loadProperties()
