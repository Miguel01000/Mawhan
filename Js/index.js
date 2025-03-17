import { supabase } from './Supabase.js';

// Función para cargar el slider con 3 mangas de la tabla "Mangas"
async function cargarSlider() {
  try {
    // Consulta 3 registros (puedes agregar un filtro, por ejemplo, .eq("destacado", true) si tienes esa columna)
    let { data: sliderMangas, error } = await supabase
      .from("Mangas")
      .select("*")
      .limit(3);

    if (error) {
      console.error("Error al cargar mangas para slider:", error);
      return;
    }

    const carousel = document.querySelector('.carousel');
    if (!carousel) {
      console.error("Contenedor del carousel no encontrado.");
      return;
    }

    // Limpiar el contenido existente del carousel
    carousel.innerHTML = "";

    // Generar cada slide dinámicamente
    sliderMangas.forEach((manga, index) => {
      const slideDiv = document.createElement("div");
      slideDiv.classList.add("slide");
      if (index === 0) {
        slideDiv.classList.add("active");
      }
      // Usa la imagen de portada para el background
      slideDiv.style.background = `url('${manga.portada}') center/cover no-repeat`;

      // Contenido del slide
      const slideContentDiv = document.createElement("div");
      slideContentDiv.classList.add("slide-content");
      slideContentDiv.innerHTML = `
        <h2>${manga.titulo}</h2>
        <p>${manga.descripcion || "Descubre este manga destacado."}</p>
        <a href="manga.html?id=${manga.id}" class="btn">Leer Ahora</a>
      `;
      slideDiv.appendChild(slideContentDiv);
      carousel.appendChild(slideDiv);
    });

    // Agregar controles de navegación al slider
    const navDiv = document.createElement("div");
    navDiv.classList.add("carousel-nav");
    const prevSpan = document.createElement("span");
    prevSpan.classList.add("prev");
    prevSpan.innerHTML = "&#10094;";
    const nextSpan = document.createElement("span");
    nextSpan.classList.add("next");
    nextSpan.innerHTML = "&#10095;";
    navDiv.appendChild(prevSpan);
    navDiv.appendChild(nextSpan);
    carousel.appendChild(navDiv);

    // Inicializar la funcionalidad del slider
    initializeSlider();
  } catch (error) {
    console.error("Error en cargarSlider:", error);
  }
}

// Función para inicializar el slider (cambio automático y controles)
function initializeSlider() {
  const slides = document.querySelectorAll('.slide');
  const prev = document.querySelector('.prev');
  const next = document.querySelector('.next');
  let currentIndex = 0;

  function showSlide(index) {
    slides.forEach((slide, i) => {
      slide.classList.toggle('active', i === index);
    });
  }

  function nextSlide() {
    currentIndex = (currentIndex + 1) % slides.length;
    showSlide(currentIndex);
  }

  function prevSlide() {
    currentIndex = (currentIndex - 1 + slides.length) % slides.length;
    showSlide(currentIndex);
  }

  if (next) {
    next.addEventListener('click', nextSlide);
  }
  if (prev) {
    prev.addEventListener('click', prevSlide);
  }

  // Cambio automático cada 5 segundos
  setInterval(nextSlide, 5000);
}

// Función para cargar el grid de mangas recientes
async function cargarMangas() {
  try {
    let { data: mangas, error } = await supabase
      .from("Mangas")
      .select("*")
      .order('created_at', { ascending: false });

    if (error) {
      console.error("Error al cargar mangas:", error);
      return;
    }

    const mangaGrid = document.querySelector(".manga-grid");
    if (!mangaGrid) {
      console.error("Contenedor '.manga-grid' no encontrado.");
      return;
    }
    mangaGrid.innerHTML = ""; // Limpia el contenedor

    if (!mangas || mangas.length === 0) {
      mangaGrid.innerHTML = "<p>No se encontraron mangas.</p>";
      return;
    }

    mangas.forEach(manga => {
      if (!manga.id) {
        console.warn("Manga sin ID detectado:", manga);
        return;
      }

      const mangaCard = document.createElement("div");
      mangaCard.classList.add("manga-card");
      mangaCard.innerHTML = `
        <a href="manga.html?id=${manga.id}" class="manga-link">
          <img src="${manga.portada || 'placeholder.jpg'}" alt="${manga.titulo}">
          <h3>${manga.titulo}</h3>
        </a>
        <p>Autor: ${manga.autor || 'Desconocido'}</p>
        <p>Último capítulo: ${manga.last_chapter || 'N/A'}</p>
      `;
      mangaGrid.appendChild(mangaCard);
    });
  } catch (error) {
    console.error("Error en cargarMangas:", error);
  }
}

// Llamar a las funciones al cargar la página
document.addEventListener("DOMContentLoaded", () => {
  cargarSlider();
  cargarMangas();
});
