// Styles/StyleLogo.js
import { StyleSheet } from 'react-native';

const styles = StyleSheet.create({
    baseLogo: {
        height: 80,
        backgroundColor: '#2C3E50',
        flexDirection: 'row', // Para alinhar o texto e o retângulo lado a lado
        alignItems: 'flex-start', // Para alinhar verticalmente os itens
        position: "relative",
        justifyContent: 'space-between', // Distribui os itens igualmente ao longo do eixo principal
    },
    retangulo: {
        marginTop: 33,
        marginLeft: 14,
        width: 25,
        height: 25,
        borderRadius: 5,
        backgroundColor: '#7662BD',
    },
    Restaurante: {
        position: 'absolute',// alinhamos para que a posição seja absoluta idependete da outra
        paddingTop: 26,
        paddingLeft: 16,
        height:'auto',
        marginRight: 5,
        fontSize: 35,
        fontWeight: 'bold',
       // fontFamily: "Poppins",
        color: "#fff",
    },MesaContainer: {
        alignItems: 'flex-end',
    },Mesa: {
        paddingRight: 14.9,
        fontSize: 14,
        marginTop: "2",
        color: "#fff",
        textTransform: 'uppercase',
    },
    imageMesa:{
        height: 35,
        width: 35,
        marginTop: 16,
        marginRight: 14,
        marginEnd: "35",
    },
});

export default styles;
