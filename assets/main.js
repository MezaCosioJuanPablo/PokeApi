const container = document.getElementById("pokemonContainer");
const searchInput = document.getElementById("searchInput");
const prevBtn = document.getElementById("prevBtn");
const nextBtn = document.getElementById("nextBtn");
const modal = document.getElementById("modal");
const modalDetails = document.getElementById("modalDetails");
const closeModal = document.querySelector(".close");
const typeButtonsContainer = document.getElementById("typeButtons");

let allPokemon = [];
let currentPage = 0;
const pageSize = 20;

// Cargar tipos
const fetchAndRenderTypes = async () => {
  const res = await fetch("https://pokeapi.co/api/v2/type");
  const data = await res.json();
  renderTypeButtons(data.results);
};

const renderTypeButtons = (types) => {
  typeButtonsContainer.innerHTML = "";
  types.forEach((type) => {
    if (["shadow", "unknown"].includes(type.name)) return;
    const btn = document.createElement("button");
    btn.textContent = type.name;
    btn.className = "type-btn";
    btn.addEventListener("click", () => fetchPokemonsByType(type.name));
    typeButtonsContainer.appendChild(btn);
  });
};

const fetchPokemonsByType = async (typeName) => {
  const res = await fetch(`https://pokeapi.co/api/v2/type/${typeName}`);
  const data = await res.json();
  const entries = data.pokemon.slice(0, 20);
  const promises = entries.map((p) =>
    fetch(p.pokemon.url).then((r) => r.json())
  );
  allPokemon = await Promise.all(promises);
  currentPage = 0;
  displayPokemons(allPokemon);
};

// Cargar 151 Pokémon
const fetchPokemons = async () => {
  const urls = [];
  for (let i = 1; i <= 151; i++) {
    urls.push(`https://pokeapi.co/api/v2/pokemon/${i}`);
  }
  const data = await Promise.all(
    urls.map((url) => fetch(url).then((res) => res.json()))
  );
  allPokemon = data;
  displayPokemons(allPokemon);
};

const displayPokemons = (pokemonList) => {
  container.innerHTML = "";
  const start = currentPage * pageSize;
  const end = start + pageSize;
  const pokemonsToShow = pokemonList.slice(start, end);

  pokemonsToShow.forEach((pokemon) => {
    const card = document.createElement("div");
    card.className = "card";
    card.innerHTML = `
      <img src="${pokemon.sprites.front_default}" alt="${pokemon.name}">
      <h3>#${pokemon.id} ${pokemon.name}</h3>
    `;
    card.addEventListener("click", () => showModal(pokemon));
    container.appendChild(card);
  });
};

const showModal = (pokemon) => {
  modal.classList.remove("hidden");
  modalDetails.innerHTML = `
    <h2>${pokemon.name} (#${pokemon.id})</h2>
    <img src="${pokemon.sprites.front_default}" alt="${pokemon.name}" />
    <p>Altura: ${pokemon.height}</p>
    <p>Peso: ${pokemon.weight}</p>
    <p>Tipo: ${pokemon.types.map((t) => t.type.name).join(", ")}</p>
  `;
};

closeModal.addEventListener("click", () => {
  modal.classList.add("hidden");
});

searchInput.addEventListener("input", () => {
  const query = searchInput.value.toLowerCase();
  const filtered = allPokemon.filter((p) => p.name.includes(query));
  currentPage = 0;
  displayPokemons(filtered);
});

prevBtn.addEventListener("click", () => {
  if (currentPage > 0) {
    currentPage--;
    displayPokemons(allPokemon);
  }
});

nextBtn.addEventListener("click", () => {
  if ((currentPage + 1) * pageSize < allPokemon.length) {
    currentPage++;
    displayPokemons(allPokemon);
  }
});

fetchPokemons();
fetchAndRenderTypes();
