const loginForm = document.getElementById('login-form')
const loginError = document.getElementById('error')

loginForm.addEventListener('submit', async (e) => {
  e.preventDefault()
  loginError.classList.add('d-none')

  try {
    await login(loginForm.email.value, loginForm.password.value)
    window.location.href = 'profile.html'
  } catch (err) {
    loginError.textContent = err.message === 'Incorrect password' || err.message === 'Cannot find user'
      ? 'Неверный email или пароль'
      : err.message
    loginError.classList.remove('d-none')
  }
})
