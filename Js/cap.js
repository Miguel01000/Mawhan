import { supabase } from './Supabase.js';
document.addEventListener('DOMContentLoaded', () => {
  const capituloLista = document.getElementById('capitulo-lista');
  const prevPageBtn = document.getElementById('prev-page');
  const nextPageBtn = document.getElementById('next-page');
  const paginaActual = document.getElementById('pagina-actual');
  const loadingSpinner = document.getElementById('loading-spinner');  // Asegúrate de agregar el spinner en tu HTML

  let pagina = 1;
  const capitulosPorPagina = 4;

  async function loadCapitulos() {
    // Mostrar el spinner de carga
    loadingSpinner.style.display = 'block';

    // Limpiar la lista y actualizar el número de página
    capituloLista.innerHTML = '';
    paginaActual.textContent = pagina;

    // Calcular rango para la consulta
    const start = (pagina - 1) * capitulosPorPagina;
    const end = pagina * capitulosPorPagina - 1;

    // Consultar los capítulos, incluyendo información del manga (portada y título)
    const { data, error } = await supabase
      .from('Capitulo')
      .select('*, Mangas(titulo,portada)')
      .order('creado', { ascending: false })
      .range(start, end);

    // Ocultar el spinner después de cargar los datos
    loadingSpinner.style.display = 'none';

    if (error) {
      console.error("Error al cargar capítulos:", error);
      capituloLista.innerHTML = '<p>Error al cargar los capítulos.</p>';
      return;
    }

    if (data.length === 0) {
      capituloLista.innerHTML = '<p>No hay capítulos para mostrar.</p>';
      nextPageBtn.disabled = true;
      return;
    }

    // Recorrer los capítulos y mostrar la tarjeta con información del manga y del capítulo
    data.forEach(capitulo => {
      const card = document.createElement('a');
      card.className = 'capitulo-item';
      // Redirigir a la página de lectura en lugar de abrir el PDF directamente
      card.href = `lectur.html?capitulo_id=${capitulo.id}`;
    
      const manga = capitulo.Mangas;
    
      card.innerHTML = `
        <div class="manga-info">
          <img src="${manga && manga.portada ? manga.portada : 'placeholder.jpg'}" alt="${manga && manga.titulo ? manga.titulo : 'Sin portada'}">
          <div class="manga-title">${manga && manga.titulo ? manga.titulo : 'Sin título'}</div>
        </div>
        <div class="capitulo-info">
          <h3>Capítulo ${capitulo.numero}: ${capitulo.titulo}</h3>
          <p>Publicado: ${new Date(capitulo.fecha_publicacion).toLocaleDateString()}</p>
        </div>
      `;
      capituloLista.appendChild(card);
    });
    

    // Actualizar botones de paginación
    prevPageBtn.disabled = (pagina === 1);
    nextPageBtn.disabled = (data.length < capitulosPorPagina);
  }

  // Eventos para la paginación
  prevPageBtn.addEventListener('click', () => {
    if (pagina > 1) {
      pagina--;
      loadCapitulos();
    }
  });

  nextPageBtn.addEventListener('click', () => {
    pagina++;
    loadCapitulos();
  });

  // Cargar los capítulos al inicio
  loadCapitulos();
});
