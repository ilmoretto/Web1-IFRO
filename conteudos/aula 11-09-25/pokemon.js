const input = document.getElementById("nome");
const btn = document.getElementById("btn");
const btnLimpar = document.getElementById("btnLimpar");
const saida = document.getElementById("saida");
const lista = document.getElementById("listaPokemons");

// funcao para remover os acentos
// usando Normalization Form Decomposition (NFD) e regex
function ajustarTexto(txt) {
    return txt.normalize("NFD").replace(/\p{Diacritic}/gu, "")
}

async function limparBusca() {
    input.value = "";
    saida.innerHTML = "";
}

// carregar a lista de pokemons
//limit = 1025 para buscar todos
async function carregarLista() {
    try {
        const res = await fetch("https://pokeapi.co/api/v2/pokemon?limit=1025");
        if (!res.ok) throw new Error("Erro ao carregar a lista")
        const data = await res.json(); // salva em json

        lista.innerHTML = data.results
            .map(p => `<option value="${p.name}">`)
            .join("");


    } catch {
        console.log("Erro ao carregar a lista de pokémons")
    }
}
carregarLista();

// chama a função de buscar quando clicar no botao ou pressionar enter
btn.addEventListener("click", buscarPokemon);
input.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
        buscarPokemon();
    }
});

// limpar a busca
btnLimpar.addEventListener("click", limparBusca);

// realiza a busca do pokemon na API
async function buscarPokemon() {
    let nome = input.value.trim().toLowerCase();
    if (nome.length === 0) {
        saida.textContent = "Informe o nome ou ID do Pokémon!"
        return // o código vai parar aqui, para não seguir para as linhas debaixo
    }
    // ajusta o texto para evitar erros com acentos
    nome = ajustarTexto(nome);
    saida.textContent = "Buscando..."

    // aqui faz a requisição para a API
    try {
        const res = await fetch(`https://pokeapi.co/api/v2/pokemon/${encodeURIComponent(nome)}`);
        if (!res.ok) throw new Error("Não encontrado!");
        const p = await res.json();

        // aqui monta a saída
        // tenta pegar a imagem oficial, se não tiver, pega a padrão
        // se não tiver nenhuma, usa string vazia
        const sprite = p.sprites.other?.["official-artwork"]?.front_default ||
            p.sprites.front_default || "";

        // pega os tipos e habilidades, juntando em uma string
        // para os golpes, pega só os 5 primeiros
        // map() cria um novo array com o resultado da função para cada item
        // join() junta os itens do array em uma string, separados pelo que for passado (", " no caso)
        const tipos = p.types.map(t => t.type.name).join(", ");
        const habilidades = p.abilities.map(a => a.ability.name).join(", ");
        const moves = p.moves.slice(0, 5).map(m => m.move.name).join(", "); // mostra apenas 5

        
        saida.innerHTML = `
    <div class="card">
        <h2>#${p.id} ${p.name}</h2>
        <img src="${sprite}" alt="${p.name}" />
        <div class="info">
            <p><b>Tipos:</b> ${tipos}</p>
            <p><b>Altura:</b> ${p.height / 10} m</p>
            <p><b>Peso:</b> ${p.weight / 10} kg</p>
            <p><b>Habilidades:</b> ${habilidades}</p>
            <p><b>Alguns golpes:</b> ${moves}</p>
        </div>
    </div>
`;
    } catch {
        saida.textContent = "Pokemao não encontrado.";
    }
}