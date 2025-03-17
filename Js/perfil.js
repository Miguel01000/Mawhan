import { supabase } from './Supabase.js';

let currentUser = null;

const cargarPerfil = async () => {
  const { data: { session }, error } = await supabase.auth.getSession();
  if (error || !session) {
    window.location.href = 'login.html';
    return;
  }

  currentUser = session.user;

  const { data: perfil, error: perfilError } = await supabase
    .from('perfil')
    .select('*')
    .eq('id_auth', currentUser.id)
    .single();

  if (perfilError) {
    console.error('Error al cargar el perfil:', perfilError);
    return;
  }

  document.getElementById('perfil-nombre').innerText = perfil.nombre || 'Nombre de Usuario';
  document.getElementById('perfil-correo').innerText = perfil.email || currentUser.email;

  if (perfil.foto) {
    document.getElementById('perfil-imagen').src = perfil.foto;
  }
};

const subirImagenPerfil = async (file) => {
  if (!currentUser) return;

  const fileExt = file.name.split('.').pop();
  const fileName = `${currentUser.id}.${fileExt}`;
  const bucketName = "perfil";  
  const filePath = `imagenes/${fileName}`;

  console.log(`Subiendo imagen a: ${bucketName}/${filePath}`);

  const { data, error } = await supabase.storage
    .from(bucketName)
    .upload(filePath, file, { upsert: true });

  if (error) {
    console.error('Error al subir la imagen:', error);
    return;
  }

  const { data: publicData } = supabase.storage.from(bucketName).getPublicUrl(filePath);
  if (publicData) {
    await supabase.from('perfil').update({ foto: publicData.publicUrl }).eq('id_auth', currentUser.id);
    document.getElementById('perfil-imagen').src = publicData.publicUrl;
  }
};

document.getElementById('btn-cambiar-imagen').addEventListener('click', () => {
  document.getElementById('input-cambiar-imagen').click();
});

document.getElementById('input-cambiar-imagen').addEventListener('change', (event) => {
  const file = event.target.files[0];
  if (file) {
    subirImagenPerfil(file);
  }
});

document.getElementById('btn-cerrar-sesion').addEventListener('click', async () => {
  await supabase.auth.signOut();
  window.location.href = 'login.html';
});

// Función para editar el nombre de usuario
document.getElementById('btn-editar-nombre').addEventListener('click', async () => {
  const currentName = document.getElementById('perfil-nombre').innerText;
  const newName = prompt("Ingrese su nuevo nombre:", currentName);
  if (newName && newName.trim() !== "") {
    const { data, error } = await supabase
      .from('perfil')
      .update({ nombre: newName })
      .eq('id_auth', currentUser.id);
    if (error) {
      console.error("Error al actualizar el nombre:", error);
      alert("Error al actualizar el nombre.");
    } else {
      document.getElementById('perfil-nombre').innerText = newName;
      alert("Nombre actualizado correctamente.");
    }
  }
});

// Función para acceder a la página de subir manga con validación de clave
document.getElementById('btn-subir-manga').addEventListener('click', () => {
  const clave = prompt("Ingrese la clave para subir manga:");
  // Clave de acceso (modifícala según necesites)
  const passwordCorrecto = "clave123";
  if (clave === passwordCorrecto) {
    window.location.href = 'subida.html';
  } else {
    alert("Clave incorrecta. Acceso denegado.");
  }
});

cargarPerfil();
