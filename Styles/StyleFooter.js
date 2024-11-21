import { StyleSheet } from 'react-native';

const styles = StyleSheet.create({
    baseRodaPe: {
        height: 80,
        backgroundColor: '#2C3E50',
        flexDirection: "row",//alinhamos para ficar um do lado do outro
        alignItems: 'center',
        justifyContent: 'space-around',
        position: 'absolute',
        left: 0,
        right: 0,
        bottom: 0,
    },
    imageFooter: {
        height: 18,
        width: 18,
        fontSize: 18,
        color: '#fff',
    },
    footerText: {
        color: "#fff",
        fontSize: 14,
        //fontFamily: "",
        //fontWeight: "",
        //fontStyle: "",
        marginTop: 5,
    },
    footerTextSelect: {
        color: "#fff",
        fontSize: 14,
        fontWeight: "bold",
        //fontStyle: "",
        marginTop: 5,
    },
    footerItem:{
        alignItems: "center",
    },
});

export default styles;
