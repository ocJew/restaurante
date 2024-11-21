import { StyleSheet } from 'react-native';

const styles = StyleSheet.create({
    espacoMesa: {
        flex: 1,
        marginLeft: 14,
        marginTop: 10,
        marginRight: 14,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#fff',
        borderRadius: 10,
    },
    Body: {
        flex: 1,
        backgroundColor: '#ECF0F1',
    },
    scrollContent: {
        padding: 90, // adiciona espaço extra para garantir que o conteúdo não fique escondido pelo rodapé
    },
    texto: {
        fontSize: 18,
        color: '#333',
    },container: {
        flex: 1,
        backgroundColor: '#f8f8f8',
      },
      tablesContainer: {
        padding: 20,
        alignItems: 'center',
        paddingBottom: 100, // Give some space at the bottom for footer
      },
      table: {
        backgroundColor: '#ccc',
        justifyContent: 'center',
        alignItems: 'center',
        marginVertical: 10,
        borderRadius: 5,
      },
      floatingButtonText: {
        color: 'white',
        fontSize: 24,
      },
      footer: {
        height: 80,
        backgroundColor: '#eaeaea',
        width: '100%',
        position: 'absolute',
        bottom: 0,
      },
    footer: {
        height: 80,
        backgroundColor: '#eaeaea',
        width: '100%',
        position: 'absolute',
        bottom: 0,
    },
    table: {
        backgroundColor: '#ccc',
        justifyContent: 'center',
        alignItems: 'center',
        marginVertical: 10,
        borderRadius: 5,
    },
});

export default styles;
