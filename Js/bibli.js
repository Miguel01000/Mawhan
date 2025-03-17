import { supabase } from './Supabase.js';

document.addEventListener("DOMContentLoaded", function() {
  async function cargarMangas(filtros = {}) {
    try {
      let query = supabase.from("Mangas").select("*");

      if (filtros.tipo && filtros.tipo.length > 0) {
        query = query.in("tipo", filtros.tipo);
      }
      if (filtros.estado && filtros.estado.length > 0) {
        query = query.in("estado", filtros.estado);
      }
      if (filtros.genero && filtros.genero.length > 0) {
        query = query.in("género", filtros.genero);
      }

      let { data: mangas, error } = await query;
      if (error) throw error;

      const resultsContainer = document.querySelector(".results-grid");
      resultsContainer.innerHTML = "";

      mangas.forEach(manga => {
        // Asegurar que el ID del manga está presente
        if (!manga.id) {
          console.warn("Manga sin ID detectado:", manga);
          return;
        }

        const mangaCard = document.createElement("div");
        mangaCard.classList.add("manga-card");
        mangaCard.innerHTML = `
          <a href="manga.html?id=${manga.id}" class="manga-link">
            <img src="${manga.portada}" alt="${manga.titulo}">
            <h3>${manga.titulo}</h3>
          </a>
          <p>Autor: ${manga.autor}</p>
          <p>Género: ${manga.género}</p>
          <p>Estado: ${manga.estado}</p>
        `;
        resultsContainer.appendChild(mangaCard);
      });

    } catch (error) {
      console.error("Error al cargar mangas:", error);
    }
  }

  cargarMangas();

  document.getElementById("applyFilters").addEventListener("click", function() {
    const tipo = Array.from(document.querySelectorAll("input[name='tipo']:checked")).map(el => el.value);
    const genero = Array.from(document.querySelectorAll("input[name='generos']:checked")).map(el => el.value);
    const excluirGeneros = Array.from(document.querySelectorAll("input[name='excluirGeneros']:checked")).map(el => el.value);

    console.log("Aplicando filtros:", { tipo, genero, excluirGeneros });
    cargarMangas({ tipo, genero, excluirGeneros });
  });

  document.getElementById("searchButton").addEventListener("click", async function() {
    const searchText = document.getElementById("searchInput").value.trim();
    if (searchText === "") {
      cargarMangas();
      return;
    }
    try {
      let { data: mangas, error } = await supabase
        .from("Mangas")
        .select("*")
        .ilike("titulo", `%${searchText}%`);

      if (error) throw error;

      const resultsContainer = document.querySelector(".results-grid");
      resultsContainer.innerHTML = "";

      mangas.forEach(manga => {
        if (!manga.id) {
          console.warn("Manga sin ID detectado:", manga);
          return;
        }

        const mangaCard = document.createElement("div");
        mangaCard.classList.add("manga-card");
        mangaCard.innerHTML = `
          <a href="manga.html?id=${manga.id}" class="manga-link">
            <img src="${manga.portada}" alt="${manga.titulo}">
            <h3>${manga.titulo}</h3>
          </a>
          <p>Autor: ${manga.autor}</p>
          <p>Género: ${manga.género}</p>
          <p>Estado: ${manga.estado}</p>
        `;
        resultsContainer.appendChild(mangaCard);
      });
    } catch (error) {
      console.error("Error en la búsqueda:", error);
    }
  });
});
