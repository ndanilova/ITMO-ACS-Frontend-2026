const registerForm = document.getElementById('register-form')
const registerError = document.getElementById('error')

registerForm.addEventListener('submit', async (e) => {
  e.preventDefault()
  registerError.classList.add('d-none')

  try {
    await register({
      firstName: registerForm.firstName.value,
      lastName: registerForm.lastName.value,
      email: registerForm.email.value,
      password: registerForm.password.value,
      role: registerForm.role.value,
      avatar: 'https://i.pravatar.cc/150?u=' + registerForm.email.value
    })
    window.location.href = 'profile.html'
  } catch (err) {
    registerError.textContent = err.message === 'Email already exists'
      ? 'Пользователь с таким email уже есть'
      : err.message
    registerError.classList.remove('d-none')
  }
})
