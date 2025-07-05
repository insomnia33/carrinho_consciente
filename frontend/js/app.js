// Classe principal do app Carrinho Consciente
class CarrinhoConsciente {
    constructor() {
        this.storage = new Storage(); // Gerencia persistência local
        this.currentList = null; // Lista atualmente aberta
        this.initializeElements(); // Pega referências dos elementos DOM
        this.attachEventListeners(); // Liga eventos aos elementos
        this.showListView(); // Começa mostrando a visão de listas
    }

    // Pega elementos do DOM necessários
    initializeElements() {
        this.listsView = document.getElementById('listsView');
        this.listDetailView = document.getElementById('listDetailView');
        this.backToListsBtn = document.getElementById('backToLists');
        this.listTitleInput = document.getElementById('listTitle');
        this.itemsListContainer = document.getElementById('itemsList');
        this.newItemNameInput = document.getElementById('newItemName');
        this.newItemQuantityInput = document.getElementById('newItemQuantity');
        this.newItemPriceInput = document.getElementById('newItemPrice');
        this.addItemBtn = document.getElementById('addItemBtn');
        this.totalAmountElement = document.getElementById('totalAmount');
        this.newListBtn = document.getElementById('newListBtn');
    }

    // Liga eventos aos elementos de interface
    attachEventListeners() {
        this.backToListsBtn.addEventListener('click', () => this.showLists());
        this.addItemBtn.addEventListener('click', () => this.addItem());
        this.newListBtn.addEventListener('click', () => this.createNewList());

        // Enter adiciona item em qualquer campo de novo item
        [this.newItemNameInput, this.newItemQuantityInput, this.newItemPriceInput].forEach(input => {
            input.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') this.addItem();
            });
        });
        // Salva título da lista automaticamente
        this.listTitleInput.addEventListener('input', () => this.autoSaveList());
    }

    // --- Gerenciamento de views ---

    // Mostra visão de todas as listas
    showListView() {
        this.listsView.classList.add('active');
        this.listDetailView.style.display = 'none';
        this.renderLists();
    }

    // Mostra detalhes de uma lista
    showListDetailView() {
        this.listsView.classList.remove('active');
        this.listDetailView.style.display = '';
    }

    // --- Operações com listas ---

    // Renderiza todos os cards de listas
    renderLists() {
        const lists = this.storage.getLists();
        // console.log('Listas carregadas:', lists); // Remover após debug
        this.listsView.innerHTML = '';
        lists.forEach(list => {
            const card = document.createElement('div');
            card.className = 'list-card';
            card.tabIndex = 0;
            card.innerHTML = `
                <input type="text" class="list-title-input" value="${list.title || ''}" data-id="${list.id}" placeholder="Nome da Lista" autocomplete="off">
                <div class="items-container">
                    ${list.items.slice(0, 5).map(item => `
                        <div class="list-item">
                            <input type="checkbox" disabled ${item.checked ? 'checked' : ''}>
                            <input type="text" value="${item.name}" readonly style="background:transparent;border:none;color:inherit;width:100%">
                        </div>`).join('')}
                    ${list.items.length > 5 ? '<span style="color:var(--text-secondary);font-size:0.9em;">...e mais</span>' : ''}
                </div>
                <div class="total-container">
                    <span>R$ ${this.calcTotal(list).toFixed(2)}</span>
                    <button class="delete-list" title="Excluir lista" data-id="${list.id}"><span class="material-icons">delete</span></button>
                </div>
            `;
            // Abre lista ao clicar no card (exceto botão de deletar)
            card.addEventListener('click', (e) => {
                if (!e.target.classList.contains('delete-list') && !e.target.closest('delete-list')) {
                    this.openList(list.id);
                }
            });
            // Exclui lista
            card.querySelector('.delete-list').addEventListener('click', (e) => {
                e.stopPropagation();
                this.deleteList(list.id);
            });
            // Edita título da lista inline
            card.querySelector('.list-title-input').addEventListener('input', (e) => {
                list.title = e.target.value;
                this.storage.saveList(list);
            });
            this.listsView.appendChild(card);
        });
    }

    // Cria uma nova lista vazia
    createNewList() {
        const newList = {
            title: '',
            items: [],
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };
        const savedList = this.storage.saveList(newList);
        this.currentList = savedList;
        this.listTitleInput.value = this.currentList.title || '';
        this.itemsListContainer.innerHTML = '';
        this.updateTotal();
        this.showListDetailView();
        this.listTitleInput.focus();
    }

    // Abre uma lista existente
    openList(listId) {
        this.currentList = this.storage.getList(listId);
        if (!this.currentList) {
            // Lista não encontrada, volta para visão de listas
            this.showLists();
            return;
        }
        this.listTitleInput.value = this.currentList.title || '';
        this.renderItems();
        this.showListDetailView();
    }

    // Volta para visão de todas as listas
    showLists() {
        this.currentList = null;
        this.showListView();
    }

    // --- Operações com itens ---

    // Renderiza todos os itens da lista aberta
    renderItems() {
        this.itemsListContainer.innerHTML = '';
        this.currentList.items.forEach(item => {
            const itemRow = document.createElement('div');
            itemRow.className = 'list-item';
            itemRow.innerHTML = `
                <input type="checkbox" class="item-checkbox" ${item.checked ? 'checked' : ''}>
                <input type="text" class="item-input" value="${item.name}" placeholder="Item">
                <input type="number" class="quantity-input" value="${item.quantity}" min="1" placeholder="Qtd">
                <input type="number" class="price-input" value="${item.price}" min="0" step="0.01" placeholder="Preço">
                <button class="btn-icon scan-price-item" title="Escanear preço"><span class="material-icons">photo_camera</span></button>
            `;
            // Eventos de edição inline e auto-save
            const [checkbox, nameInput, qtyInput, priceInput, scanBtn] = itemRow.children;
            checkbox.addEventListener('change', () => {
                item.checked = checkbox.checked;
                this.autoSaveList();
            });
            nameInput.addEventListener('input', () => {
                item.name = nameInput.value;
                this.autoSaveList();
            });
            qtyInput.addEventListener('input', () => {
                item.quantity = parseFloat(qtyInput.value) || 1;
                this.autoSaveList();
            });
            priceInput.addEventListener('input', () => {
                item.price = parseFloat(priceInput.value) || 0;
                this.autoSaveList();
            });
            scanBtn.addEventListener('click', () => {
                this.handleScanPriceItem(item.id);
            });
            this.itemsListContainer.appendChild(itemRow);
        });
        this.updateTotal();
    }

    // Placeholder para futura função OCR
    handleScanPriceItem(itemId) {
        alert(`Escanear preço para o item ${itemId} (funcionalidade OCR)`);
        // Implementação OCR será feita futuramente
    }

    // Adiciona novo item à lista atual
    addItem() {
        const name = this.newItemNameInput.value.trim();
        const quantity = parseFloat(this.newItemQuantityInput.value) || 1;
        const price = parseFloat(this.newItemPriceInput.value) || 0;
        if (!name) return;
        const item = {
            id: Date.now().toString(),
            name,
            quantity,
            price,
            checked: false
        };
        this.currentList.items.push(item);
        this.newItemNameInput.value = '';
        this.newItemQuantityInput.value = '1';
        this.newItemPriceInput.value = '';
        this.renderItems();
        this.autoSaveList();
        this.newItemNameInput.focus();
    }

    // Atualiza o total da lista aberta
    updateTotal() {
        const total = this.calcTotal(this.currentList);
        this.totalAmountElement.textContent = `R$ ${total.toFixed(2)}`;
    }

    // Calcula o total dos itens marcados da lista
    calcTotal(list) {
        if (!list || !list.items) return 0;
        return list.items.filter(i => i.checked).reduce((sum, i) => sum + (i.price * i.quantity), 0);
    }

    // Salva automaticamente a lista atual
    autoSaveList() {
        if (!this.currentList) return;
        this.currentList.title = this.listTitleInput.value.trim();
        this.storage.saveList(this.currentList);
        this.updateTotal();
    }

    // Exclui uma lista
    deleteList(listId) {
        if (confirm('Excluir esta lista?')) {
            this.storage.deleteList(listId);
            this.showLists();
        }
    }
}

// Inicializa o app ao carregar a página
document.addEventListener('DOMContentLoaded', () => {
    new CarrinhoConsciente();
});
