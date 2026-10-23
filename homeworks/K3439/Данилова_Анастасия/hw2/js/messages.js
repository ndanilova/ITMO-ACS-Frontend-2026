requireAuth()

const me = getUser()
let chats = []
let currentChatId = Number(new URLSearchParams(window.location.search).get('chat'))

async function loadChats() {
  // json-server не умеет OR, поэтому два запроса
  const asTenant = await api(`/chats?tenantId=${me.id}&_expand=property`)
  const asLandlord = await api(`/chats?landlordId=${me.id}&_expand=property`)
  chats = [...asTenant, ...asLandlord]

  if (!chats.length) {
    document.getElementById('chats').innerHTML = '<p class="text-muted">Диалогов пока нет</p>'
    return
  }

  if (!currentChatId) currentChatId = chats[0].id
  renderChats()
  loadMessages()
}

function renderChats() {
  document.getElementById('chats').innerHTML = chats.map(c => {
    const name = c.tenantId === me.id ? c.landlordName : c.tenantName
    return `
      <a href="#" class="list-group-item list-group-item-action ${c.id === currentChatId ? 'active' : ''}" data-id="${c.id}">
        <b>${escapeHtml(name)}</b><br>
        <small>${escapeHtml(c.property.title)}</small>
      </a>`
  }).join('')
}

async function loadMessages() {
  const chat = chats.find(c => c.id === currentChatId)
  if (!chat) return

  const name = chat.tenantId === me.id ? chat.landlordName : chat.tenantName
  document.getElementById('chat-title').innerHTML =
    `<b>${escapeHtml(name)}</b> · <a href="property.html?id=${chat.propertyId}">${escapeHtml(chat.property.title)}</a>`

  const messages = await api(`/messages?chatId=${currentChatId}&_sort=createdAt`)
  const box = document.getElementById('messages')
  box.innerHTML = messages.map(m =>
    `<div class="msg ${m.senderId === me.id ? '' : 'msg-other'}">${escapeHtml(m.text)}</div>`
  ).join('') || '<p class="text-muted">Сообщений нет, напишите первым</p>'
  box.scrollTop = box.scrollHeight
}

document.getElementById('chats').addEventListener('click', (e) => {
  const link = e.target.closest('a[data-id]')
  if (!link) return
  e.preventDefault()
  currentChatId = Number(link.dataset.id)
  renderChats()
  loadMessages()
})

const sendForm = document.getElementById('send-form')

sendForm.addEventListener('submit', async (e) => {
  e.preventDefault()
  const text = sendForm.text.value.trim()
  if (!text || !currentChatId) return

  await api('/messages', {
    method: 'POST',
    body: JSON.stringify({
      chatId: currentChatId,
      senderId: me.id,
      text: text,
      createdAt: new Date().toISOString()
    })
  })
  sendForm.reset()
  loadMessages()
})

// история сделок: где я арендатор и где владелец
async function loadDeals() {
  const mine = await api(`/rentals?userId=${me.id}&_expand=property`)
  const toMe = await api(`/rentals?landlordId=${me.id}&_expand=property`)
  const deals = [...mine, ...toMe].sort((a, b) => b.createdAt.localeCompare(a.createdAt))

  document.getElementById('deals').innerHTML = deals.map(d => `
    <li class="list-group-item d-flex justify-content-between">
      <span>
        ${formatDate(d.createdAt)} — ${d.userId === me.id ? 'аренда' : 'сдача'}
        «${escapeHtml(d.property.title)}», ${formatPrice(d.totalPrice)}
      </span>
      ${statusBadge(d.status)}
    </li>`).join('') || '<li class="list-group-item text-muted">Сделок пока нет</li>'
}

loadChats()
loadDeals()
