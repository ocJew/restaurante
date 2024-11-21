import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createStackNavigator } from "@react-navigation/stack";
import Footer from './components/footer';
import MesaScreen from './screens/MesaScreen';
import CalendarioScreen from './screens/CalendarioScreen';
import CardapioScreen from './screens/CardapioScreen';

const Tab = createBottomTabNavigator(); //criamos um navegador de abas

// Componente principal de navegação por abas
const MainTabs = () => {
    return (
        <Tab.Navigator
            tabBar={(props) => <Footer {...props} />} // Define o componente de rodapé personalizado
            screenOptions={{ headerShown: false, tabBarShowLabel: false }} // Oculta cabeçalhos e rótulos das abas
        >
            <Tab.Screen name="Mesa" component={MesaScreen} />
            <Tab.Screen name="Calendario" component={CalendarioScreen} />
            <Tab.Screen name="Cardápio" component={CardapioScreen} />
        </Tab.Navigator>
    );
}

export default MainTabs; // Exporta o componente de navegação principal