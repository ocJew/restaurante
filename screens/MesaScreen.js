// MesaScreen.js
import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import Body from '../components/body'; // Certifique-se de que o caminho está correto
import MesaScreenInfo from './MesaScreenInfo'; // Certifique-se de que o caminho está correto
import Header from '../components/TopoDoAplicativo';

const Stack = createStackNavigator();

const MesaScreen = () => {
    return (
        <Stack.Navigator>
            <Stack.Screen name="Body" component={Body} options={{ headerShown: false }} />
            <Stack.Screen name="MesaScreenInfo" component={MesaScreenInfo} options={{ headerShown: false }} />
        </Stack.Navigator>
    );
};

export default MesaScreen;
