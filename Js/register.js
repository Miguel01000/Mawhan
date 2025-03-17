import { supabase } from './Supabase.js';

const registerForm = document.getElementById('register-form');

registerForm.addEventListener('submit', async (e) => {
  e.preventDefault();

  const nombre = document.getElementById('nombre').value.trim();
  const email = document.getElementById('email').value.trim();
  const password = document.getElementById('password').value;

  if (!nombre || !email || !password) {
    alert("Por favor, completa todos los campos.");
    return;
  }

  try {
    // 1️⃣ Crear usuario en Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
    });

    if (authError) {
      throw authError;
    }

    // 2️⃣ Obtener el ID del usuario recién creado
    const userId = authData.user.id;

    // 3️⃣ Insertar datos en la tabla perfil
    const { error: profileError } = await supabase
      .from('perfil')
      .insert([
        {
          id_auth: userId,
          nombre,
          email,
          foto: "", // Imagen por defecto o vacío
          ultima_lectura: null,
          creado: new Date().toISOString(),
          actualizado: new Date().toISOString(),
        }
      ]);

    if (profileError) {
      throw profileError;
    }

    alert("Registro exitoso. Revisa tu correo para confirmar tu cuenta.");
    window.location.href = "login.html"; // Redirige al login

  } catch (error) {
    console.error("Error en el registro:", error.message);
    alert("Error al registrar usuario: " + error.message);
  }
});
