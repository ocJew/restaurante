import React from 'react';
import { View, Text, Image, TouchableOpacity } from 'react-native';
import styles from '../Styles/StyleFooter';

const Footer = ({ state, descriptors, navigation }) => {
    const getIcon = (name) => {
        switch (name) {
            case 'Mesa':
                return require('../image/mesa.png');
            case 'Calendario':
                return require('../image/calendario.png');
            case 'Cardápio':
                return require('../image/novidades.png');
            default:
                return null;
        }
    };

    return (
        <View style={styles.baseRodaPe}>
            {state.routes.map((route, index) => {
                const isFocused = state.index === index;

                const onPress = () => {
                    const event = navigation.emit({
                        type: 'tabPress',
                        target: route.key,
                    });

                    if (!isFocused && !event.defaultPrevented) {
                        navigation.navigate(route.name);
                    }
                };

                return (
                    <TouchableOpacity
                        key={route.key}
                        onPress={onPress}
                        style={styles.footerItem}
                    >
                        <View style={styles.footerItem}>
                            <View style={isFocused ? styles.imageContainerSelected : null}>
                                <Image
                                    style={styles.imageFooter}
                                    source={getIcon(route.name)}
                                />
                            </View>
                            <Text style={isFocused ? styles.footerTextSelect : styles.footerText}>
                                {route.name}
                            </Text>
                        </View>
                    </TouchableOpacity>
                );
            })}
        </View>
    );
};

export default Footer;
