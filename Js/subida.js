import { supabase } from './Supabase.js';

/**
 * Valida el archivo antes de subirlo.
 * @param {File} file - Archivo a validar.
 * @returns {boolean} - True si es válido, False si no.
 */
function validateImageFile(file) {
  const validExtensions = ['jpg', 'jpeg', 'png', 'webp'];
  const fileExt = file.name.split('.').pop().toLowerCase();
  const isValidExt = validExtensions.includes(fileExt);
  const isValidSize = file.size <= 10 * 1024 * 1024; // 10MB

  if (!isValidExt) {
    alert('Solo se permiten imágenes en formato JPG, PNG o WEBP.');
    return false;
  }
  if (!isValidSize) {
    alert('El archivo es demasiado grande (máximo 10MB).');
    return false;
  }
  return true;
}

/**
 * Sube un archivo a un bucket de Supabase y obtiene su URL pública.
 * @param {string} bucketName - Nombre del bucket en Supabase Storage.
 * @param {string} folder - Carpeta interna.
 * @param {File} file - Archivo a subir.
 * @param {string} userId - ID del usuario.
 * @returns {Promise<string|null>} - URL pública o null en caso de error.
 */
async function uploadFile(bucketName, folder, file, userId) {
  try {
    if (!file) {
      alert('No se seleccionó un archivo.');
      return null;
    }

    if (bucketName === 'mangas' && folder === 'portada' && !validateImageFile(file)) {
      return null;
    }

    const fileExt = file.name.split('.').pop().toLowerCase();
    const fileName = `${userId}_${Date.now()}.${fileExt}`;
    const filePath = `${folder}/${fileName}`;

    // Subir el archivo
    const { error: uploadError } = await supabase.storage
      .from(bucketName)
      .upload(filePath, file, { upsert: true });

    if (uploadError) {
      console.error(`Error al subir archivo a ${bucketName}:`, uploadError);
      alert('Error al subir archivo.');
      return null;
    }

    // Obtener la URL pública
    const { data } = supabase.storage
      .from(bucketName)
      .getPublicUrl(filePath);

    return data.publicUrl;
  } catch (err) {
    console.error('Error en uploadFile:', err);
    alert('Error inesperado al subir el archivo.');
    return null;
  }
}

// Funciones específicas para subir archivos
async function uploadPortada(file, userId) {
  return await uploadFile('mangas', 'portada', file, userId);
}

async function uploadPDF(file, userId) {
  return await uploadFile('Capitulos', 'lol', file, userId);
}

// 🎯 Manejo del formulario de MANGA
document.getElementById('manga-form').addEventListener('submit', async (e) => {
  e.preventDefault();

  const titulo = document.getElementById('manga-title').value.trim();
  const sinopsis = document.getElementById('manga-sinopsis').value.trim();
  const autor = document.getElementById('manga-autor').value.trim();
  const genero = document.getElementById('manga-genero').value.split(',').map(g => g.trim());
  const estado = document.getElementById('manga-estado').value;
  const portadaFile = document.getElementById('manga-portada').files[0];

  const { data: user, error: userError } = await supabase.auth.getUser();
  if (userError || !user?.user) {
    alert("Debes iniciar sesión para subir archivos.");
    return;
  }
  const userId = user.user.id;

  let portadaUrl = '';
  if (portadaFile) {
    portadaUrl = await uploadPortada(portadaFile, userId);
  }

  const { error } = await supabase.from('Mangas').insert([
    { titulo, sinopsis, autor, portada: portadaUrl, genero, estado, id_auth: userId }
  ]);

  if (error) {
    console.error('Error al insertar manga:', error);
    alert('Error al subir manga.');
  } else {
    alert('¡Manga subido exitosamente!');
    document.getElementById('manga-form').reset();
    loadMangaOptions();
  }
});

// 🎯 Cargar opciones de mangas en select
async function loadMangaOptions() {
  const select = document.getElementById('chapter-manga');
  const { data, error } = await supabase.from('Mangas').select('id, titulo');

  if (error) {
    console.error('Error al obtener mangas:', error);
    return;
  }

  select.innerHTML = '';
  data.forEach(manga => {
    const option = document.createElement('option');
    option.value = manga.id;
    option.textContent = manga.titulo;
    select.appendChild(option);
  });
}

// 🎯 Manejo del formulario de CAPÍTULO
document.getElementById('chapter-form').addEventListener('submit', async (e) => {
  e.preventDefault();

  const id_manga = document.getElementById('chapter-manga').value;
  const titulo = document.getElementById('chapter-title').value.trim();
  const numero = parseInt(document.getElementById('chapter-number').value);
  const fecha_publicacion = document.getElementById('chapter-publication').value;
  const pdfFile = document.getElementById('chapter-pdf').files[0];

  const { data: user, error: userError } = await supabase.auth.getUser();
  if (userError || !user?.user) {
    alert("Debes iniciar sesión para subir archivos.");
    return;
  }
  const userId = user.user.id;

  let pdfUrl = '';
  if (pdfFile) {
    pdfUrl = await uploadPDF(pdfFile, userId);
  }

  const { error } = await supabase.from('Capitulo').insert([
    { id_manga, titulo, numero, fecha_publicacion, pdf_url: pdfUrl }
  ]);

  if (error) {
    console.error('Error al insertar capítulo:', error);
    alert('Error al subir capítulo.');
  } else {
    alert('¡Capítulo subido exitosamente!');
    document.getElementById('chapter-form').reset();
  }
});

// 🎯 Función para buscar mangas
document.getElementById('search-btn').addEventListener('click', async () => {
  const searchTerm = document.getElementById('search-input').value.trim();
  if (!searchTerm) return;

  const { data, error } = await supabase
    .from('Mangas')
    .select('id, titulo, sinopsis')
    .ilike('titulo', `%${searchTerm}%`);

  const resultsList = document.getElementById('results-list');
  resultsList.innerHTML = '';

  if (error) {
    console.error('Error en búsqueda:', error);
    alert('Error al realizar la búsqueda.');
    return;
  }

  if (data.length === 0) {
    resultsList.innerHTML = '<li>No se encontraron resultados.</li>';
  } else {
    data.forEach(manga => {
      const li = document.createElement('li');
      li.textContent = `${manga.titulo} - ${manga.sinopsis}`;
      resultsList.appendChild(li);
    });
  }
});

// Cargar opciones de mangas al iniciar
window.addEventListener('DOMContentLoaded', loadMangaOptions);


// Código adicional (opcional) para subir archivo PDF directamente, si lo requieres
/*
<script>
  async function uploadFileDirect(file) {
    if (file.type !== 'application/pdf') {
      alert('Por favor, selecciona un archivo PDF.');
      return;
    }
    try {
      const { data, error } = await supabase.storage
        .from('Capitulos')
        .upload(file.name, file, {
          contentType: 'application/pdf',
        });
      if (error) {
        console.error('Error al subir el archivo:', error);
        alert('Error al subir el archivo.');
      } else {
        console.log('Archivo subido con éxito:', data);
        alert('Archivo subido con éxito.');
      }
    } catch (error) {
      console.error('Error inesperado:', error);
      alert('Error inesperado.');
    }
  }
  document.getElementById('fileInput').addEventListener('change', (event) => {
    const file = event.target.files[0];
    if (file) {
      uploadFileDirect(file);
    }
  });
</script>
*/


