import { supabase } from './Supabase.js';

document.addEventListener('DOMContentLoaded', () => {
  const paginaActual = document.getElementById('pagina-actual');
  const btnPrevio = document.getElementById('btn-previo');
  const btnSiguiente = document.getElementById('btn-siguiente');
  const btnReporte = document.getElementById('btn-reporte');
  const infoCapitulo = document.getElementById('info-capitulo'); // Encabezado del capítulo

  let capituloActual = null;
  let capituloId = parseInt(new URLSearchParams(window.location.search).get('capitulo_id'), 10); // ✅ Convertir a número

  // Función para cargar el capítulo en la vista de lectura
  async function cargarCapitulo() {
    if (isNaN(capituloId)) {
      alert('Capítulo no encontrado');
      return;
    }

    // Obtener los datos del capítulo desde Supabase, incluyendo la relación con Mangas
    const { data, error } = await supabase
      .from('Capitulo')
      .select('id, numero, titulo, pdf_url, fecha_publicacion, id_manga, Mangas(titulo, portada)') // ✅ Incluir id_manga
      .eq('id', capituloId)
      .single();

    if (error || !data) {
      console.error('Error al cargar capítulo:', error);
      alert('No se pudo cargar el capítulo.');
      return;
    }

    // Asignar el capítulo actual
    capituloActual = data;
    console.log('Capítulo cargado:', capituloActual);

    // Verificar si Mangas está presente antes de usar sus propiedades
    const tituloManga = capituloActual.Mangas ? capituloActual.Mangas.titulo : "Manga Desconocido";

    // Actualizar el encabezado con la información del capítulo y manga
    if (infoCapitulo) {
      infoCapitulo.textContent = `Capítulo ${capituloActual.numero} - ${tituloManga}`;
    }

    // Cargar el PDF en el iframe
    paginaActual.src = capituloActual.pdf_url; // ✅ Cargar correctamente la URL del PDF

    // Actualizar el título del documento
    document.title = `Lectura de ${tituloManga} - Capítulo ${capituloActual.numero}`;
  }

  // Funciones de navegación entre capítulos del mismo manga
  async function cambiarCapitulo(operador) {
    if (!capituloActual || !capituloActual.id_manga) {
      alert('Datos del capítulo no disponibles');
      return;
    }

    // Determinar el filtro de id según el operador
    const filtro = operador === 'siguiente' ? 'gt' : 'lt'; // Usar 'gt' para siguiente, 'lt' para anterior
    const orden = operador === 'siguiente' ? 'asc' : 'desc'; // Orden ascendente para siguiente, descendente para anterior

    const { data, error } = await supabase
      .from('Capitulo')
      .select('id')
      .eq('id_manga', capituloActual.id_manga) // Filtrar por el mismo manga
      .filter('id', filtro, capituloActual.id) // Usar 'gt' o 'lt'
      .order('id', { ascending: orden === 'asc' }) // Ordenar según el operador
      .limit(1)
      .single();

    if (error || !data) {
      alert(operador === 'siguiente' ? 'No hay capítulo siguiente' : 'No hay capítulo anterior');
      return;
    }

    capituloId = data.id;
    cargarCapitulo(); // Cargar el nuevo capítulo
  }

  btnPrevio.addEventListener('click', () => cambiarCapitulo('anterior'));
  btnSiguiente.addEventListener('click', () => cambiarCapitulo('siguiente'));

  // Función para reportar el capítulo roto
  btnReporte.addEventListener('click', () => {
    alert('Capítulo reportado como roto.');
    // Aquí puedes agregar lógica para reportar el capítulo en la base de datos
  });

  // Cargar el capítulo al inicio
  if (!isNaN(capituloId)) {
    cargarCapitulo();
  } else {
    alert('No se encontró el capítulo');
  }
});

