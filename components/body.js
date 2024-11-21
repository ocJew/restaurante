import React, { useState, useEffect } from 'react';
import { View, FlatList, Text, StyleSheet, Alert, TextInput, Modal, TouchableOpacity, TouchableWithoutFeedback, Keyboard, Dimensions, Image } from 'react-native';
import { FloatingAction } from 'react-native-floating-action';
import { useNavigation } from '@react-navigation/native';
import { ref, set, onValue, push, remove } from 'firebase/database';
import { auth, database } from '../firebase';  // Import the auth and database instances from firebase.js
import Float from "../Styles/StyleBody";

const windowWidth = Dimensions.get('window').width;
const logoMesa = require('../assets/logoMesa.png');
const logoMesaGrup = require('../assets/logoMesaGrup.png');

const Body = () => {
    const [tables, setTables] = useState([]);
    const [tableCounter, setTableCounter] = useState(1);
    const [newTableNumber, setNewTableNumber] = useState('');
    const [modalVisible, setModalVisible] = useState(false);
    const [tableGroups, setTableGroups] = useState([]);
    const navigation = useNavigation();
    const currentUser = auth.currentUser;

    useEffect(() => {
        const unsubscribe = navigation.addListener('focus', () => {
            fetchTables();
        });

        return unsubscribe;
    }, [navigation]);

    const fetchTables = () => {
        if (currentUser) {
            const userId = currentUser.uid;
            const tablesRef = ref(database, `users/${userId}/tables`);
            onValue(tablesRef, (snapshot) => {
                const data = snapshot.val();
                if (data) {
                    const loadedTables = Object.keys(data).map(key => ({
                        ...data[key],
                        id: key,
                    }));
                    setTables(loadedTables);
                    setTableCounter(loadedTables.length + 1);
                } else {
                    setTables([]);
                    setTableCounter(1);
                }
            });
        }
    };

    useEffect(() => {
        fetchTables();
    }, [currentUser]);

    const addTable = () => {
        const number = newTableNumber ? newTableNumber.trim() : '';
        if (number && currentUser) {
            const userId = currentUser.uid;
            const newTable = {
                id: number,
                number: number,
                position: tableCounter,
                width: windowWidth / 4 - 20,
                height: 150,
                grouped: false,
            };
            const newTableRef = push(ref(database, `users/${userId}/tables`));
            set(newTableRef, newTable);
            setNewTableNumber('');
            setModalVisible(false);
        } else {
            Alert.alert('Por favor, insira um número de mesa');
        }
    };

    const addTableGroup = () => {
        const group = tableGroups.join(',');
        if (group && currentUser) {
            const userId = currentUser.uid;
            const newTable = {
                id: group,
                number: group,
                position: tableCounter,
                width: windowWidth - 40,
                height: 150,
                grouped: true,
            };
            const newTableRef = push(ref(database, `users/${userId}/tables`));
            set(newTableRef, newTable);
            setTableGroups([]);
            setModalVisible(false);
        } else {
            Alert.alert('Por favor, insira números de mesa para agrupar');
        }
    };

    const deleteAllTables = () => {
        if (tables.length > 0 && currentUser) {
            Alert.alert(
                'Apagar todas as mesas',
                'Tem certeza de que deseja apagar todas as mesas?',
                [
                    {
                        text: 'Cancelar',
                        onPress: () => console.log('Cancelado'),
                        style: 'cancel',
                    },
                    {
                        text: 'Apagar',
                        onPress: () => {
                            const userId = currentUser.uid;
                            set(ref(database, `users/${userId}/tables`), null);
                        },
                        style: 'destructive',
                    },
                ],
                { cancelable: true }
            );
        } else {
            Alert.alert('Nenhuma mesa para apagar');
        }
    };

    const deleteTable = (id) => {
        if (currentUser) {
            Alert.alert(
                'Apagar mesa',
                `Tem certeza de que deseja apagar a mesa ${id}?`,
                [
                    {
                        text: 'Cancelar',
                        onPress: () => console.log('Cancelado'),
                        style: 'cancel',
                    },
                    {
                        text: 'Apagar',
                        onPress: () => {
                            const userId = currentUser.uid;
                            remove(ref(database, `users/${userId}/tables/${id}`));
                        },
                        style: 'destructive',
                    },
                ],
                { cancelable: true }
            );
        }
    };

    const handleTablePress = (id, number) => {
        navigation.navigate('MesaScreenInfo', { tableId: id, tableNumber: number });
    };

    const renderTable = ({ item }) => (
        <TouchableOpacity
            onLongPress={() => deleteTable(item.id)}
            onPress={() => handleTablePress(item.id, item.number)}
            style={[Float.table, styles.tableMargin, { width: item.width, height: item.height }]}
        >
            <View style={styles.tableContent}>
                <Image source={item.grouped ? logoMesaGrup : logoMesa} style={styles.logoImage} />
                <Text style={styles.tableText}>Mesa: {item.number}</Text>
                <Text style={styles.tableText}>{item.position}</Text> {/* Adicionar o campo de posição */}
            </View>
        </TouchableOpacity>
    );

    const groupedTables = () => {
        let grouped = [];
        let row = [];

        tables.forEach((table, index) => {
            if (table.grouped) {
                grouped.push([table]); // Adiciona mesas agrupadas em uma linha separada
            } else {
                row.push(table);
                if (row.length === 4 || index === tables.length - 1) {
                    grouped.push(row);
                    row = [];
                }
            }
        });

        return grouped;
    };

    return (
        <TouchableWithoutFeedback onPress={() => setModalVisible(false)}>
            <View style={[Float.container, styles.containerPadding]}>
                <FlatList
                    data={groupedTables()}
                    renderItem={({ item }) => (
                        <View style={{ flexDirection: 'row', justifyContent: 'flex-start' }}>
                            {item.map((table) => (
                                <TouchableOpacity
                                    key={table.id}
                                    onLongPress={() => deleteTable(table.id)}
                                    onPress={() => handleTablePress(table.id, table.number)}
                                    style={[Float.table, styles.tableMargin, { width: table.width, height: table.height }]}
                                >
                                    <View style={styles.tableContent}>
                                        <Image source={table.grouped ? logoMesaGrup : logoMesa} style={styles.logoImage} />
                                        <Text style={styles.tableText}>Mesa {table.number}</Text>
                                        <Text style={styles.tableText}> {table.position}</Text>
                                    </View>
                                </TouchableOpacity>
                            ))}
                        </View>
                    )}
                    keyExtractor={(item, index) => index.toString()}
                    contentContainerStyle={{ alignItems: 'flex-start', paddingBottom: 80 }}
                />
                <View style={Float.footer} />
                
                <FloatingAction
                    actions={[
                        {
                            name: 'bt_add',
                            text: 'Adicionar Mesa',
                            color: 'blue',
                        },
                        { name: 'bt_delete', text: 'Apagar Todas', color: 'red' },
                    ]}
                    onPressItem={(name) => {
                        if (name === 'bt_add' || name === 'bt_group') {
                            setModalVisible(true);
                        } else if (name === 'bt_delete') {
                            deleteAllTables();
                        }
                    }}
                    floatingIcon={<Text style={Float.floatingButtonText}>+</Text>}
                    position="right"
                    distanceToEdge={{ vertical: 85, horizontal: 5 }}
                />

                <Modal
                    animationType="slide"
                    transparent={true}
                    visible={modalVisible}
                    onRequestClose={() => {
                        setModalVisible(!modalVisible);
                    }}
                >
                    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                        <View style={styles.centeredView}>
                            <View style={styles.modalView}>
                                {modalVisible && (
                                    <>
                                        <TextInput
                                            placeholder="Número da Mesa"
                                            value={newTableNumber}
                                            onChangeText={setNewTableNumber}
                                            style={styles.input}
                                            keyboardType="numeric"
                                        />
                                        <TouchableOpacity
                                            style={[styles.button, styles.buttonClose]}
                                            onPress={addTable}
                                        >
                                            <Text style={styles.textStyle}>Adicionar Mesa</Text>
                                        </TouchableOpacity>
                                        <TextInput
                                            placeholder="Mesas (separadas por vírgula)"
                                            value={tableGroups.join(',')}
                                            onChangeText={(text) => setTableGroups(text.split(','))}
                                            style={styles.input}
                                        />
                                        <TouchableOpacity
                                            style={[styles.button, styles.buttonClose]}
                                            onPress={addTableGroup}
                                        >
                                            <Text style={styles.textStyle}>Juntar Mesas</Text>
                                        </TouchableOpacity>
                                    </>
                                )}
                            </View>
                        </View>
                    </TouchableWithoutFeedback>
                </Modal>
            </View>
        </TouchableWithoutFeedback>
    );
};

const styles = StyleSheet.create({
    containerPadding: {
        padding: 10,
    },
    tableMargin: {
        margin: 5,
    },
    tableContent: {
        flex: 1,
        borderColor: '#04BB00',
        borderWidth: 2,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'white',
        width: '100%',
        height: 'auto',
        borderRadius: 7,
    },
    logoImage: {
        width: '99.7%',
        height: '73.5%',
        borderTopRightRadius: 5,
        borderTopLeftRadius: 5,
    },
    tableText: {
        textAlign: 'center',
    },
    centeredView: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 22,
    },
    modalView: {
        margin: 20,
        backgroundColor: 'white',
        borderRadius: 20,
        padding: 35,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 5,
    },
    button: {
        borderRadius: 5,
        padding: 10,
        elevation: 2,
        marginBottom: 10,
    },
    buttonClose: {
        backgroundColor: '#FFBB12',
    },
    textStyle: {
        color: '#004FAC',
        fontWeight: 'bold',
        textAlign: 'center',
    },
    input: {
        height: 40,
        margin: 12,
        borderWidth: 0.5,
        borderRadius: 2,
        padding: 10,
        width: 200,
    },
});

export default Body;
