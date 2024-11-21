import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Button, TouchableOpacity, SafeAreaView, ScrollView, Pressable, Alert } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { ref, onValue, update, push } from 'firebase/database';
import { database, auth, loadMenuItems, addMenuItemToTable } from '../firebase';
import { AntDesign } from '@expo/vector-icons';

const MesaScreenInfo = ({ route }) => {
    const { tableId } = route.params;
    const [menuItems, setMenuItems] = useState([]);
    const [modalVisible, setModalVisible] = useState(false);
    const [itemModalVisible, setItemModalVisible] = useState(false);
    const [selectedItem, setSelectedItem] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('');
    const [comidas, setComidas] = useState([]);
    const [bebidas, setBebidas] = useState([]);
    const [sobremesas, setSobremesas] = useState([]);
    const [cardapioComidas, setCardapioComidas] = useState([]);
    const [cardapioBebidas, setCardapioBebidas] = useState([]);
    const [cardapioSobremesas, setCardapioSobremesas] = useState([]);
    const [tableNumber, setTableNumber] = useState('');
    const [userId, setUserId] = useState('');

    const [showAddForm, setShowAddForm] = useState(false); // Estado para controlar a visibilidade do formulário
    const [editMode, setEditMode] = useState(false); // Estado para controlar o modo de edição
    const [editItem, setEditItem] = useState(null); // Estado para armazenar o item em edição  
    const [newMenuItem, setNewMenuItem] = useState('');
    const [newMenuItemPrice, setNewMenuItemPrice] = useState('');
    const [loading, setLoading] = useState(true);

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

    const renderItemsForms = (items) => (
        items.map(item => (
            <Picker.Item key={item.id} label={item.name} value={item.name} />
        ))
    );

    useEffect(() => {
        const currentUser = auth.currentUser;
        if (currentUser) {
            setUserId(currentUser.uid);
            loadTableData(currentUser.uid, tableId);
            loadCardapio();
        }
    }, [tableId]);

    const loadTableData = (userId, tableId) => {
        const tableRef = ref(database, `users/${userId}/mesas/${tableId}`);
        onValue(tableRef, (snapshot) => {
            const tableData = snapshot.val();
            if (tableData) {
                setTableNumber(tableData.number);
                setComidas(tableData.comidas || []);
                setBebidas(tableData.bebidas || []);
                setSobremesas(tableData.sobremesas || []);
            } else {
                initializeTableData(userId, tableId);
            }
        });
    };

    const loadCardapio = () => {
        const cardapioRef = ref(database, 'cardapio');
        onValue(cardapioRef, (snapshot) => {
            const cardapio = snapshot.val();
            if (cardapio) {
                const comidasList = Object.values(cardapio).filter(item => item.category === 'comida');
                const bebidasList = Object.values(cardapio).filter(item => item.category === 'bebida');
                const sobremesasList = Object.values(cardapio).filter(item => item.category === 'sobremesa');
                setCardapioComidas(comidasList);
                setCardapioBebidas(bebidasList);
                setCardapioSobremesas(sobremesasList);
            }
        });
    };

    const initializeTableData = (userId, tableId) => {
        const tableRef = ref(database, `users/${userId}/mesas/${tableId}`);
        update(tableRef, {
            comidas: [],
            bebidas: [],
            sobremesas: [],
            number: 'Número da Mesa'
        });
        setComidas([]);
        setBebidas([]);
        setSobremesas([]);
    };

    const handleAddQuantity = (index, category) => {
        const updatedItems = [...getItemsByCategory(category)];
        updatedItems[index].quantity += 1;
        updatedItems[index].totalPrice = updatedItems[index].quantity * updatedItems[index].price;
        updateItems(category, updatedItems);
    };

    const handleSubtractQuantity = (index, category) => {
        const updatedItems = [...getItemsByCategory(category)];
        if (updatedItems[index].quantity > 0) {
            updatedItems[index].quantity -= 1;
            updatedItems[index].totalPrice = updatedItems[index].quantity * updatedItems[index].price;
        }
        updateItems(category, updatedItems);
    };

    const handleDeleteItem = (index, category) => {
        Alert.alert(
            'Confirmar exclusão',
            'Tem certeza que deseja excluir este item?',
            [
                {
                    text: 'Cancelar',
                    style: 'cancel'
                },
                {
                    text: 'Excluir',
                    onPress: () => {
                        const updatedItems = [...getItemsByCategory(category)];
                        updatedItems.splice(index, 1);
                        updateItems(category, updatedItems);
                    }
                }
            ]
        );
    };

    const getItemsByCategory = (category) => {
        switch (category) {
            case 'comidas':
                return comidas;
            case 'bebidas':
                return bebidas;
            case 'sobremesas':
                return sobremesas;
            default:
                return [];
        }
    };

    const updateItems = (category, items) => {
        const tableRef = ref(database, `users/${userId}/mesas/${tableId}`);
        update(tableRef, {
            [category]: items
        });
    };

    const renderItems = (items, category) => {
        if (items.length > 0) {
            return items.map((item, index) => (
                <Pressable
                    key={index}
                    style={({ pressed }) => [
                        styles.itemContainer,
                        { backgroundColor: pressed ? '#E2E6E9' : 'transparent' }
                    ]}
                    onLongPress={() => handleDeleteItem(index, category)}
                >
                    <View style={styles.itemTextContainer}>
                        <Text style={styles.itemText}>{`- ${item.name}`}</Text>
                        <Text style={styles.itemPrice}>{`R$ ${item.price}`}</Text>
                    </View>
                    <View style={styles.metaContainer}>
                        <View style={styles.quantityMeta}>
                            <Text style={styles.metaText}>Quantidade</Text>
                            <View style={styles.quantityControl}>
                                <TouchableOpacity style={styles.rectangleMinus} onPress={() => handleSubtractQuantity(index, category)}>
                                    <Text style={styles.symbol}>-</Text>
                                </TouchableOpacity>
                                <Text style={styles.quantityText}>{item.quantity}</Text>
                                <TouchableOpacity style={styles.rectanglePlus} onPress={() => handleAddQuantity(index, category)}>
                                    <Text style={styles.symbol}>+</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                        <View style={styles.totalPriceContainer}>
                            <Text style={styles.metaText}>Preço Total</Text>
                            <Text style={styles.totalPriceText}>{`R$ ${item.totalPrice}`}</Text>
                        </View>
                    </View>
                </Pressable>
            ));
        } else {
            return (
                <Text style={styles.itemText}>Nenhum item adicionado.</Text>
            );
        }
    };

    const toggleAddForm = () => {
        setShowAddForm(!showAddForm); // Alternar o estado para mostrar ou ocultar o formulário
        setEditMode(false); // Resetar o modo de edição ao ocultar o formulário
        setEditItem(null); // Limpar o item em edição ao ocultar o formulário
        setNewMenuItem('');
        setNewMenuItemPrice('');
        setSelectedCategory('Comida'); // Resetar categoria selecionada para 'Comida'
    };

    const handleAddItem = async () => {
        try {
            await addMenuItemToTable(auth.currentUser.uid, tableId, selectedItem); // Substitua 'mesaId' pelo ID da mesa real
            console.log(`Item ${selectedItem} adicionado à mesa.`);
        } catch (error) {
            console.error('Erro ao adicionar item à mesa:', error.message);
        }
    };

    // Filtrar os itens por categoria
    const categoria = menuItems.filter(item => item.category === selectedCategory);

    return (
        <SafeAreaView style={styles.container}>
            <Text style={styles.tableText}>{`Mesa ${tableNumber}`}</Text>
            <ScrollView style={styles.scrollContainer}>
                <View style={styles.innerContainer}>
                    <Text style={styles.sectionTitle}>Comidas</Text>
                    {renderItems(comidas, 'comidas')}

                    <Text style={styles.sectionTitle}>Bebidas</Text>
                    {renderItems(bebidas, 'bebidas')}

                    <Text style={styles.sectionTitle}>Sobremesas</Text>
                    {renderItems(sobremesas, 'sobremesas')}
                </View>
            </ScrollView>

            {/* Botão de expansão/colapso do formulário */}
            <TouchableOpacity style={styles.toggleFormButton} onPress={toggleAddForm}>
                <AntDesign name={showAddForm ? 'up' : 'down'} size={24} color="black" />
            </TouchableOpacity>
            {/* Formulário de adição de itens (expansível) */}
            {showAddForm && (
                <View style={styles.formContainer}>
                    <Text style={styles.formTitle}>{editMode ? 'Editar Item' : 'Adicionar Item a Mesa'}</Text>
                    <Text>Selecione a categoria:</Text>
                    <Picker
                        selectedValue={selectedCategory}
                        onValueChange={(itemValue, itemIndex) => setSelectedCategory(itemValue)}
                        style={styles.picker}
                    >
                        <Picker.Item label="Comida" value="Comida" />
                        <Picker.Item label="Bebida" value="Bebida" />
                        <Picker.Item label="Sobremesa" value="Sobremesa" />
                    </Picker>
                    <Text>Selecione o item:</Text>
                    <Picker
                        selectedValue={selectedItem}
                        onValueChange={(itemValue, itemIndex) => setSelectedItem(itemValue)}
                    >
                        {renderItemsForms(categoria)}
                    </Picker>
                    <Button
                        title= 'Adicionar Item'
                        onPress={handleAddItem}
                    />
                </View>
            )}
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 10,
        paddingBottom: 90,
    },
    outerContainer: {
        flex: 1,
        padding: 10,
        backgroundColor: '#FFFFFF',
    },
    tableText: {
        fontSize: 18,
        marginBottom: 10,
        textAlign: 'center',
        fontWeight: 'bold',
        color: '#004FAC',
        fontFamily: 'Roboto',
    },
    innerContainer: {
        paddingBottom: 20,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#004FAC',
        marginTop: 10,
        marginBottom: 5,
        fontFamily: 'Roboto',
    },
    itemContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderBottomWidth: 1,
        borderBottomColor: '#E2E6E9',
        paddingVertical: 10,
    },
    itemTextContainer: {
        flex: 1,
    },
    itemText: {
        fontSize: 16,
        fontFamily: 'Roboto',
        color: '#004FAC',
    },
    itemPrice: {
        fontSize: 12,
        fontFamily: 'Roboto',
        color: '#67747D',
    },
    metaContainer: {
        flexDirection: 'column',
        alignItems: 'flex-start',
        marginLeft: 10,
        marginTop: 10,
    },
    quantityMeta: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 4,
    },
    quantityControl: {
        flexDirection: 'row',
        alignItems: 'center',
        marginLeft: 10,
    },
    rectangleMinus: {
        width: 12,
        height: 12,
        borderRadius: 2,
        backgroundColor: '#E2E6E9',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 7,
    },
    rectanglePlus: {
        width: 12,
        height: 12,
        borderRadius: 2,
        backgroundColor: '#33FF00',
        alignItems: 'center',
        justifyContent: 'center',
        marginLeft: 7,
    },
    symbol: {
        fontSize: 10,
        fontWeight: 'bold',
        color: '#333',
    },
    quantityText: {
        fontSize: 10,
        fontWeight: '600',
        color: '#67747D',
        marginHorizontal: 7,
    },
    metaText: {
        fontSize: 10,
        fontWeight: '600',
        color: '#67747D',
        marginBottom: 4,
        fontFamily: 'Roboto',
        marginLeft: 20,
    },
    centeredView: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    modalView: {
        backgroundColor: 'white',
        padding: 20,
        borderRadius: 10,
        alignItems: 'center',
        elevation: 5,
    },
    optionButton: {
        backgroundColor: '#004FAC',
        borderRadius: 5,
        padding: 10,
        marginBottom: 10,
        width: 200,
        alignItems: 'center',
    },
    optionText: {
        color: 'white',
        fontSize: 18,
        fontWeight: 'bold',
        fontFamily: 'Roboto',
    },
    floatingButtonText: {
        color: 'white',
        fontSize: 30,
    },
    scrollContainer: {
        flexGrow: 1,
        paddingBottom: 80,
    },
    totalPriceContainer: {
        marginTop: 10,
    },
    totalPriceText: {
        fontSize: 12,
        fontFamily: 'Roboto',
        color: '#67747D',
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

export default MesaScreenInfo;
