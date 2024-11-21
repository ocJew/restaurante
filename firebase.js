import { initializeApp } from 'firebase/app';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { getDatabase, ref, push, set, remove, onValue } from 'firebase/database';
import { get } from 'firebase/database';
import AsyncStorage from '@react-native-async-storage/async-storage';

const firebaseConfig = {
  apiKey: "AIzaSyANBU9f3-_bA3eBhDVLi8Sx1Jy0XlScIio",
  authDomain: "restaurante-5f3a7.firebaseapp.com",
  databaseURL: "https://restaurante-5f3a7-default-rtdb.firebaseio.com",
  projectId: "restaurante-5f3a7",
  storageBucket: "restaurante-5f3a7.appspot.com",
  messagingSenderId: "1035152857640",
  appId: "1:1035152857640:android:3424513fe3083a265f331d"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const database = getDatabase(app);

// Verifica a mudança no estado da autenticação
const checkAuthState = (callback) => {
  onAuthStateChanged(auth, async (user) => {
    if (user) {
      try {
        const storedUser = await AsyncStorage.getItem('user');
        if (!storedUser) {
          await AsyncStorage.setItem('user', JSON.stringify(user));
        }
      } catch (error) {
        console.error('Erro ao acessar AsyncStorage:', error.message);
      }
    } else {
      try {
        await AsyncStorage.removeItem('user');
      } catch (error) {
        console.error('Erro ao remover usuário do AsyncStorage:', error.message);
      }
    }
    callback(user);
  });
};

// Função para excluir um item do cardápio do usuário logado
const deleteMenuItem = async (userId, itemId) => {
  try {
    const menuRef = ref(database, `cardapio/${userId}/${itemId}`);
    await remove(menuRef);
  } catch (error) {
    console.error('Erro ao excluir item do cardápio:', error.message);
    throw error;
  }
};

// Função para carregar itens do cardápio do usuário logado
const loadMenuItems = (userId, setMenuItems) => {
  const menuRef = ref(database, `cardapio/${userId}`);
  onValue(menuRef, (snapshot) => {
    const data = snapshot.val();
    if (data) {
      const menuItemsArray = Object.keys(data).map((key) => ({
        id: key,
        name: data[key].name || '',
        price: data[key].price || 0,
        category: data[key].category || 'Comida', // Adicione o campo de categoria aqui
      }));
      setMenuItems(menuItemsArray);
    } else {
      setMenuItems([]);
    }
  });
};

// Função para atualizar um item do cardápio do usuário logado
const updateMenuItem = async (userId, updatedItem) => {
  try {
    const { id, ...itemData } = updatedItem;
    const menuRef = ref(database, `cardapio/${userId}/${id}`);
    await set(menuRef, itemData);
  } catch (error) {
    console.error('Erro ao atualizar item do cardápio:', error.message);
    throw error;
  }
};

// Função para adicionar um item ao cardápio do usuário logado
const addMenuItem = async (userId, newItem) => {
  const menuRef = ref(database, `cardapio/${userId}`);
  try {
    await push(menuRef, newItem);
  } catch (error) {
    console.error('Erro ao adicionar item ao cardápio:', error.message);
    throw error;
  }
};

// Função para carregar todos os itens do cardápio do usuário logado
const loadAllMenuItems = (userId, setMenuItems) => {
  const menuRef = ref(database, `cardapio/${userId}`);
  onValue(menuRef, (snapshot) => {
    const data = snapshot.val();
    if (data) {
      const menuItemsArray = Object.keys(data).map((tableId) => {
        return Object.keys(data[tableId]).map((itemId) => ({
          id: itemId,
          name: data[tableId][itemId].name || '',
          price: data[tableId][itemId].price || 0,
          category: data[tableId][itemId].category || 'Comida',
          // Adicione outros campos conforme necessário
          tableId: tableId // Inclui o ID da mesa para referência
        }));
      }).flat();
      setMenuItems(menuItemsArray);
    } else {
      setMenuItems([]);
    }
  });
};

// Função para carregar itens do cardápio de uma mesa específica do usuário logado
const loadMenuItemsByTable = (userId, tableId, setMenuItems) => {
  const menuRef = ref(database, `cardapio/${userId}/${tableId}`);
  onValue(menuRef, (snapshot) => {
    const data = snapshot.val();
    if (data) {
      const menuItemsArray = Object.keys(data).map((itemId) => ({
        id: itemId,
        name: data[itemId].name || '',
        price: data[itemId].price || 0,
        category: data[itemId].category || 'Comida',
        // Adicione outros campos conforme necessário
        tableId: tableId // Inclui o ID da mesa para referência
      }));
      setMenuItems(menuItemsArray);
    } else {
      setMenuItems([]);
    }
  });
};

// Função para adicionar um item ao cardápio de uma mesa específica com a categoria correta
const addItemToTableCategory = async (userId, tableId, category, newItem) => {
  const menuRef = ref(database, `users/${userId}/mesas/${tableId}/${category}`);

  try {
    const newMenuRef = push(menuRef); // Cria uma nova referência com um ID único gerado automaticamente
    await set(newMenuRef, newItem); // Define os dados do novo item na referência criada
  } catch (error) {
    console.error('Erro ao adicionar item ao cardápio da mesa:', error.message);
    throw error;
  }
};

// Função para adicionar um item ao cardápio de uma mesa específica do usuário logado
const addMenuItemToTable = async (userId, tableId, itemId) => {
  try {
    console.log('Iniciando processo para adicionar item ao cardápio da mesa...');
    // Inicialize a instância do banco de dados
    const database = getDatabase();
    // Primeiro, carrega os detalhes do item a partir do cardápio do usuário
    const itemRef = ref(database, `cardapio/${userId}/${itemId}`);
    console.log('Referência do item:', itemRef.toString());
    // Obtém os dados do item
    const snapshot = await get(itemRef);
    console.log('Snapshot obtido:', snapshot);
    // Verifica se o snapshot contém dados válidos
    if (!snapshot.exists()) {
      throw new Error('Item não encontrado no cardápio.');
    }
    const newItem = snapshot.val();
    console.log('Novo item:', newItem);
    // Adiciona o item à mesa específica
    const menuRef = ref(database, `users/${userId}/mesas/${tableId}`);
    console.log('Referência da mesa:', menuRef.toString());
    const newMenuRef = push(menuRef); // Cria uma nova referência com um ID único gerado automaticamente
    console.log('Nova referência do menu:', newMenuRef.toString());
    await set(newMenuRef, newItem); // Define os dados do novo item na referência criada
    console.log('Item adicionado com sucesso à mesa');
  } catch (error) {
    console.error('Erro ao adicionar item ao cardápio da mesa:', error.message);
    throw error;
  }
};

// Função para excluir um item do cardápio de uma mesa específica do usuário logado
const deleteMenuItemFromTable = async (userId, tableId, itemId) => {
  try {
    const menuRef = ref(database, `cardapio/${userId}/${tableId}/${itemId}`);
    await remove(menuRef);
  } catch (error) {
    console.error('Erro ao excluir item do cardápio:', error.message);
    throw error;
  }
};

// Função para atualizar um item do cardápio de uma mesa específica do usuário logado
const updateMenuItemInTable = async (userId, tableId, updatedItem) => {
  try {
    const { id, ...itemData } = updatedItem;
    const menuRef = ref(database, `cardapio/${userId}/${tableId}/${id}`);
    await set(menuRef, itemData);
  } catch (error) {
    console.error('Erro ao atualizar item do cardápio:', error.message);
    throw error;
  }
};


export {
  auth,
  database,
  checkAuthState,
  loadMenuItems,
  addMenuItem,
  updateMenuItem,
  deleteMenuItem,
  loadAllMenuItems,
  loadMenuItemsByTable,
  addMenuItemToTable,
  updateMenuItemInTable,
  deleteMenuItemFromTable,
  addItemToTableCategory // Exporta também a nova função
};
