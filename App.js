import React, { useState, useEffect } from 'react';
import { View, StatusBar, StyleSheet, ActivityIndicator } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Header from './components/TopoDoAplicativo';
import Footer from './components/footer';
import MesaScreen from './screens/MesaScreen';
import CalendarioScreen from './screens/CalendarioScreen';
import CardapioScreen from './screens/CardapioScreen';
import LoginScreen from './screens/LoginScreen';
import { auth, checkAuthState } from './firebase'; // Importe a função checkAuthState do seu arquivo firebase
import MainTabs from './MainTabs';

const App = () => {
    const [loading, setLoading] = useState(true);
    const [userAuthenticated, setUserAuthenticated] = useState(false);

    useEffect(() => {
        checkAuthState((user) => {
            if (user) {
                setUserAuthenticated(true);
            } else {
                setUserAuthenticated(false);
            }
            setLoading(false);
        });

        const unsubscribe = auth.onAuthStateChanged((user) => {
            if (!user) {
                setUserAuthenticated(false);
            }
        });

        return () => unsubscribe();
    }, []);

    if (loading) {
        return (
            <View style={styles.loading}>
                <ActivityIndicator size="large" color="#0000ff" />
            </View>
        );
    }

    return (
        <NavigationContainer>
            <View style={styles.container}>
                <StatusBar barStyle="light-content" />
                {userAuthenticated ? (
                    <>
                        <Header />
                        <MainTabs />
                    </>
                ) : (
                    <LoginScreen />
                )}
            </View>
        </NavigationContainer>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'space-between',
    },
    loading: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
});

export default App;