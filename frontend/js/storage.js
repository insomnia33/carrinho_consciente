class Storage {
    constructor() {
        this.STORAGE_KEY = 'carrinho_consciente_lists';
    }

    getLists() {
        const lists = localStorage.getItem(this.STORAGE_KEY);
        return lists ? JSON.parse(lists) : [];
    }

    saveList(list) {
        const lists = this.getLists();
        if (list.id) {
            // Update existing list
            const index = lists.findIndex(l => l.id === list.id);
            if (index !== -1) {
                lists[index] = list;
            }
        } else {
            // Create new list
            list.id = Date.now().toString();
            lists.push(list);
        }
        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(lists));
        // Sempre retorna o objeto atualizado do storage
        return lists.find(l => l.id === list.id);
    }

    deleteList(listId) {
        const lists = this.getLists();
        const newLists = lists.filter(list => list.id !== listId);
        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(newLists));
    }

    getList(listId) {
        const lists = this.getLists();
        return lists.find(list => list.id === listId);
    }
}
