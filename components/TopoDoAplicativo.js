// Componente ajustado para imagem local
import React from 'react';
import { View, Text, Image } from 'react-native';
import styles from '../Styles/StyleLogo';  // Verifique se o caminho está correto

const TopoDoAplicativo = () => {
    return (
        <View style={styles.baseLogo}>
            <Text style={styles.retangulo}></Text>
            <Text style={styles.Restaurante}>Restaurante</Text>
            <View style={styles.MesaContainer}> 
                <Image
                    style={styles.imageMesa}
                    source={require('../image/imageLogo.png')} // Ajuste o caminho conforme necessário
                />
            <Text style={styles.Mesa}>MESAS</Text>
            </View>
        </View>
    );
};

export default TopoDoAplicativo;
