
import { supabase } from './Supabase.js';
const loginForm = document.getElementById('login-form');
const btnRegister = document.getElementById('btn-register');
const btnForgot = document.getElementById('btn-forgot');
const btnGuest = document.getElementById('btn-guest');

// ✅ Iniciar sesión con email y contraseña
loginForm.addEventListener('submit', async (e) => {
  e.preventDefault();

  const email = document.getElementById('email').value.trim();
  const password = document.getElementById('password').value;

  if (!email || !password) {
    alert("Por favor, completa todos los campos.");
    return;
  }

  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) throw error;

    if (!data.user) {
      alert("No se pudo obtener la información del usuario.");
      return;
    }

    alert("Inicio de sesión exitoso!");

    // 🔹 Guardar sesión en localStorage para futuras consultas
    localStorage.setItem('user_session', JSON.stringify(data.session));

    // 🔹 Redirigir al dashboard o página principal
    window.location.href = "index.html";

  } catch (error) {
    console.error("Error al iniciar sesión:", error.message);
    alert("Error al iniciar sesión: " + error.message);
  }
});

// ✅ Redirigir a la página de registro
btnRegister.addEventListener('click', () => {
  window.location.href = "register.html";
});

// ✅ Restablecer contraseña
btnForgot.addEventListener('click', async () => {
  const email = document.getElementById('email').value.trim();

  if (!email) {
    alert("Ingresa tu correo electrónico en el campo para restablecer la contraseña.");
    return;
  }

  try {
    const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: window.location.origin + '/reset-password.html',
    });

    if (error) throw error;

    alert("Se ha enviado un correo para restablecer la contraseña.");
  } catch (error) {
    console.error("Error al enviar correo de recuperación:", error.message);
    alert("Error al enviar correo de recuperación: " + error.message);
  }
});

// ✅ Iniciar sesión como invitado
btnGuest.addEventListener('click', async () => {
  const guestEmail = 'guest@example.com';
  const guestPassword = 'guestpassword';

  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: guestEmail,
      password: guestPassword,
    });

    if (error) throw error;

    alert("Inicio de sesión como invitado exitoso!");
    window.location.href = "index.html";

  } catch (error) {
    console.error("Error al iniciar sesión como invitado:", error.message);
    alert("Error al iniciar sesión como invitado: " + error.message);
  }
});
