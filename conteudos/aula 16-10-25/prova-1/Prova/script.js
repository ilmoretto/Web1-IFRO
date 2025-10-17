const apiUrl = 'http://localhost:3000/items'; // URL da API

document.addEventListener('DOMContentLoaded', () => {
    // Referências para os elementos da página
    const itemForm = document.getElementById('item-form');
    const itemIdInput = document.getElementById('item-id');
    const itemNameInput = document.getElementById('item-name');
    const btnSave = document.getElementById('btn-save');
    const btnCancel = document.getElementById('btn-cancel');
    const itemList = document.getElementById('item-list');

    // Carrega os itens quando a página é aberta
    loadItems();

    // Adiciona ou atualiza o item ao enviar o formulário
    itemForm.addEventListener('submit', (e) => {
        e.preventDefault(); // Evita o recarregamento da página
        itemIdInput.value ? updateItem(itemIdInput.value, itemNameInput.value) : createItem(itemNameInput.value);
    });

    // Reseta o formulário quando o botão de cancelar é clicado
    btnCancel.addEventListener('click', resetForm);

    // Função para carregar e exibir os itens da API
    async function loadItems() {
        try {
            const res = await fetch(apiUrl);
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            const data = await res.json();
            itemList.innerHTML = '';
            const items = Array.isArray(data) ? data : (data.data || data.items || []);
            if (!Array.isArray(items)) {
                console.warn('Formato inesperado ao carregar items:', data);
                return;
            }
            items.forEach(addItemToList);
        } catch (err) {
            console.error('Erro ao carregar items:', err);
        }
    }

    // Função que cria a interface do item e adiciona à lista
    function addItemToList(item) {
        const li = document.createElement('li');
        const name = item.name || item.nome || item.Name || item.Nome || '';
        const itemId = item.id || item.Id || item._id || null;

        li.innerHTML = `<span class="item-name">${escapeHtml(name)}</span>
                        <div class="item-actions">
                          <button class="btn-edit" type="button">Editar</button>
                          <button class="btn-delete" type="button">Excluir</button>
                        </div>`;

        const btnEdit = li.querySelector('.btn-edit');
        const btnDelete = li.querySelector('.btn-delete');

        btnEdit.addEventListener('click', () => {
            editItem({ id: itemId, name });
        });

        btnDelete.addEventListener('click', () => {
            if (!itemId) return console.warn('ID ausente para exclusão:', item);
            deleteItem(itemId);
        });

        itemList.appendChild(li);
    }

    // pequena função para evitar injeção de HTML
    function escapeHtml(str) {
        const div = document.createElement('div');
        div.textContent = str;
        return div.innerHTML;
    }


    // Função para criar um novo item via POST
    function createItem(name) {
        fetch(apiUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name }) // Envia o nome do novo item
        })
            .then(res => res.json()) // Converte a resposta para JSON
            .then(item => {
                addItemToList(item); // Adiciona o item criado à lista
                itemForm.reset(); // Limpa o formulário
            })
            .catch(console.error); // Exibe o erro no console
    }

    // Função que preenche o formulário para edição do item
    function editItem(item) {
        itemIdInput.value = item.id; // Preenche o ID do item
        itemNameInput.value = item.name; // Preenche o nome do item
        btnSave.textContent = 'Atualizar Item'; // Altera o texto do botão para "Atualizar"
        btnCancel.classList.remove('hidden'); // Mostra o botão de cancelar
    }

    // Função para atualizar um item via PUT
    function updateItem(id, name) {
        fetch(`${apiUrl}/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name }) // Envia o nome atualizado
        })
            .then(() => {
                resetForm(); // Reseta o formulário após a atualização
                loadItems(); // Recarrega a lista de itens
            })
            .catch(console.error); // Exibe o erro no console
    }

    // Função para deletar um item via DELETE
    function deleteItem(id) {
        if (confirm('Tem certeza que deseja excluir este item?')) { // Confirmação
            fetch(`${apiUrl}/${id}`, { method: 'DELETE' }) // Requisição DELETE
                .then(() => loadItems()) // Recarrega a lista após a exclusão
                .catch(console.error); // Exibe o erro no console
        }
    }

    // Função para resetar o formulário
    function resetForm() {
        itemIdInput.value = ''; // Limpa o campo ID
        itemNameInput.value = ''; // Limpa o campo de nome
        btnSave.textContent = 'Adicionar Item'; // Volta o botão para "Adicionar"
        btnCancel.classList.add('hidden'); // Esconde o botão de cancelar
    }
});
