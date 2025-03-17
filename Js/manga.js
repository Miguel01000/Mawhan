import { supabase } from './Supabase.js';

document.addEventListener("DOMContentLoaded", async function() {
  const urlParams = new URLSearchParams(window.location.search);
  const mangaId = parseInt(urlParams.get("id"), 10);

  if (isNaN(mangaId)) {
    alert("Manga no encontrado");
    return;
  }

  try {
    // Obtener los detalles del manga
    const { data: manga, error: mangaError } = await supabase
      .from("Mangas")
      .select("id, titulo, sinopsis, autor, portada, genero, estado")
      .eq("id", mangaId)
      .single();

    if (mangaError) throw mangaError;

    // Mostrar datos del manga
    document.getElementById("manga-titulo").innerText = manga.titulo;
    document.getElementById("manga-sinopsis").innerText = manga.sinopsis;
    document.getElementById("manga-autor").innerText = manga.autor;
    document.getElementById("manga-genero").innerText = manga.genero;
    document.getElementById("manga-estado").innerText = manga.estado;
    document.getElementById("manga-portada").src = manga.portada;

    // Obtener los capítulos del manga
    const { data: capitulos, error: capitulosError } = await supabase
      .from("Capitulo") // Asegúrate de que la tabla se llame "Capitulo"
      .select("id, numero, titulo, fecha_publicacion")
      .eq("id_manga", mangaId)
      .order("numero", { ascending: true });

    if (capitulosError) throw capitulosError;

    // Mostrar los capítulos en el DOM
    const capitulosList = document.getElementById("capitulos-list");
    capitulosList.innerHTML = ""; // Limpiar la lista antes de cargar

    if (capitulos.length === 0) {
      capitulosList.innerHTML = "<p>No hay capítulos disponibles.</p>";
      return;
    }

    capitulos.forEach(capitulo => {
      const capituloCard = document.createElement("div");
      capituloCard.classList.add("capitulo-card");
      capituloCard.innerHTML = `
        <h4>Capítulo ${capitulo.numero}: ${capitulo.titulo || "Sin título"}</h4>
        <p>Publicado: ${capitulo.fecha_publicacion ? new Date(capitulo.fecha_publicacion).toLocaleDateString() : "Desconocido"}</p>
      `;

      capituloCard.addEventListener("click", () => {
        window.location.href = `lectur.html?capitulo_id=${capitulo.id}`; // ✅ Corrección aquí
      });
      

      capitulosList.appendChild(capituloCard);
    });

  } catch (error) {
    console.error("Error al cargar el manga o los capítulos:", error);
    alert("Error al cargar los capítulos. Revisa la consola.");
  }
});
