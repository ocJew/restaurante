// CardapioScreen.js

import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, Button, ScrollView, SafeAreaView, TouchableOpacity, Alert } from 'react-native';
import { auth, loadMenuItems, addMenuItem, updateMenuItem, deleteMenuItem } from '../firebase'; // Importe as funções do Firebase
import { Picker } from '@react-native-picker/picker'; // Importe o Picker correto
import { AntDesign } from '@expo/vector-icons'; // Importe o ícone do Expo para a seta

const NovidadesScreen = () => {
  const [menuItems, setMenuItems] = useState([]);
  const [newMenuItem, setNewMenuItem] = useState('');
  const [newMenuItemPrice, setNewMenuItemPrice] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Comida');
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false); // Estado para controlar a visibilidade do formulário
  const [editMode, setEditMode] = useState(false); // Estado para controlar o modo de edição
  const [editItem, setEditItem] = useState(null); // Estado para armazenar o item em edição

  useEffect(() => {
    const fetchMenu = async () => {
      try {
        await loadMenuItems(auth.currentUser.uid, setMenuItems);
        setLoading(false);
      } catch (error) {
        console.error('Erro ao carregar o cardápio:', error.message);
        setLoading(false);
      }
    };

    fetchMenu();
  }, []);

  const handleAddMenuItem = async () => {
    try {
      if (newMenuItem.trim() === '' || newMenuItemPrice.trim() === '') {
        alert('Preencha todos os campos para adicionar ao cardápio.');
        return;
      }

      const newItem = {
        name: newMenuItem,
        price: parseFloat(newMenuItemPrice) || 0,
        category: selectedCategory,
      };

      if (editMode && editItem) {
        // Modo de edição
        await updateMenuItem(auth.currentUser.uid, { id: editItem.id, ...newItem });
        setEditMode(false);
        setEditItem(null);
      } else {
        // Modo de adição
        await addMenuItem(auth.currentUser.uid, newItem);
      }

      setNewMenuItem('');
      setNewMenuItemPrice('');
      setSelectedCategory('Comida'); // Resetar categoria selecionada para 'Comida'

      // Recarregar os itens do cardápio após adicionar ou editar um item
      await loadMenuItems(auth.currentUser.uid, setMenuItems);
    } catch (error) {
      console.error('Erro ao adicionar ou editar item ao cardápio:', error.message);
    }
  };

  const handleEditItem = (item) => {
    // Preencher o formulário com os valores do item selecionado para edição
    setEditMode(true);
    setEditItem(item);
    setNewMenuItem(item.name);
    setNewMenuItemPrice(item.price.toString());
    setSelectedCategory(item.category);
    setShowAddForm(true); // Mostrar o formulário de adição/editação
  };

  const handleDeleteItem = async (item) => {
    try {
      const confirmDelete = () => {
        Alert.alert(
          'Confirmação',
          `Tem certeza que deseja excluir "${item.name}"?`,
          [
            { text: 'Cancelar', style: 'cancel' },
            {
              text: 'Excluir',
              onPress: async () => {
                await deleteMenuItem(auth.currentUser.uid, item.id);
                await loadMenuItems(auth.currentUser.uid, setMenuItems);
              },
              style: 'destructive',
            },
          ],
          { cancelable: true }
        );
      };

      confirmDelete();
    } catch (error) {
      console.error('Erro ao excluir item do cardápio:', error.message);
    }
  };

  // Filtrar os itens por categoria
  const comidas = menuItems.filter(item => item.category === 'Comida');
  const bebidas = menuItems.filter(item => item.category === 'Bebida');
  const sobremesas = menuItems.filter(item => item.category === 'Sobremesa');

  const renderItems = (items, category) => (
    items.map(item => (
      <TouchableOpacity
        key={item.id}
        style={styles.itemContainer}
        onLongPress={() => handleEditItem(item)} // Abrir opções ao manter pressionado
      >
        <View style={styles.itemDetails}>
          <Text style={styles.itemName}>{item.name}</Text>
          <Text style={styles.itemPrice}>Preço: R$ {item.price.toFixed(2)}</Text>
        </View>
        {/* Ícones de edição e exclusão */}
        <View style={styles.iconsContainer}>
          <TouchableOpacity onPress={() => handleEditItem(item)}>
            <AntDesign name="edit" size={24} color="blue" style={styles.editIcon} />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => handleDeleteItem(item)}>
            <AntDesign name="delete" size={24} color="red" style={styles.deleteIcon} />
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    ))
  );

  const toggleAddForm = () => {
    setShowAddForm(!showAddForm); // Alternar o estado para mostrar ou ocultar o formulário
    setEditMode(false); // Resetar o modo de edição ao ocultar o formulário
    setEditItem(null); // Limpar o item em edição ao ocultar o formulário
    setNewMenuItem('');
    setNewMenuItemPrice('');
    setSelectedCategory('Comida'); // Resetar categoria selecionada para 'Comida'
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text>Carregando o cardápio...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Cardápio do Restaurante</Text>

      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.innerContainer}>
          <View>
            <Text style={styles.sectionTitle}>Comidas</Text>
            {renderItems(comidas, 'Comida')}
          </View>
          <View>
            <Text style={styles.sectionTitle}>Bebidas</Text>
            {renderItems(bebidas, 'Bebida')}
          </View>
          <View>
            <Text style={styles.sectionTitle}>Sobremesas</Text>
            {renderItems(sobremesas, 'Sobremesa')}
          </View>
        </View>
      </ScrollView>

      {/* Botão de expansão/colapso do formulário */}
      <TouchableOpacity style={styles.toggleFormButton} onPress={toggleAddForm}>
        <AntDesign name={showAddForm ? 'up' : 'down'} size={24} color="black" />
      </TouchableOpacity>

      {/* Formulário de adição de itens (expansível) */}
      {showAddForm && (
        <View style={styles.formContainer}>
          <Text style={styles.formTitle}>{editMode ? 'Editar Item' : 'Adicionar Item ao Cardápio'}</Text>

          <TextInput
            style={styles.input}
            value={newMenuItem}
            onChangeText={(text) => setNewMenuItem(text)}
            placeholder="Nome do item"
          />

          <TextInput
            style={styles.input}
            value={newMenuItemPrice}
            onChangeText={(text) => setNewMenuItemPrice(text)}
            placeholder="Preço (ex: 10.00)"
            keyboardType="numeric"
          />

          <Picker
            selectedValue={selectedCategory}
            onValueChange={(itemValue, itemIndex) => setSelectedCategory(itemValue)}
            style={styles.picker}
          >
            <Picker.Item label="Comida" value="Comida" />
            <Picker.Item label="Bebida" value="Bebida" />
            <Picker.Item label="Sobremesa" value="Sobremesa" />
          </Picker>

          <Button
            title={editMode ? 'Salvar Edição' : 'Adicionar Item'}
            onPress={handleAddMenuItem}
          />
        </View>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 20,
    paddingBottom: 90,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'space-between',
  },
  innerContainer: {
    paddingTop: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  itemContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 16,
    backgroundColor: '#f0f0f0',
    marginBottom: 8,
    borderRadius: 8,
  },
  itemDetails: {
    flex: 1,
  },
  itemName: {
    fontSize: 16,
    color: '#222',
  },
  itemPrice: {
    fontSize: 14,
    color: '#777',
  },
  itemCategory: {
    fontSize: 12,
    color: '#999',
  },
  iconsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  editIcon: {
    marginLeft: 10,
  },
  deleteIcon: {
    marginLeft: 10,
  },
  formContainer: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  formTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    padding: 10,
    marginBottom: 10,
  },
  picker: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    marginBottom: 10,
  },
  toggleFormButton: {
    alignSelf: 'center',
    marginTop: 10,
  },
});

export default NovidadesScreen;
