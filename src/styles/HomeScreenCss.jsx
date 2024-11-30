import { StyleSheet } from "react-native";
import { SH,SW,SF } from "../../utils/dimensions";
import Colors from "../../utils/Colors";

const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor:Colors.bg_theme,
    },
    buttonText: {
      color:Colors.theme,
      fontSize: SF(9),
      fontFamily:"Poppins-Bold",
      padding:SW(2)
    }, 
    button: {
      backgroundColor:Colors.white,
      padding: SW(15),
      borderRadius: 50,
      alignItems: 'center',
      justifyContent: 'center',
      marginVertical: SH(5),
      width:SW(100),
      height:SH(100),
      borderColor:Colors.theme,
      borderWidth:1
    },
    imagePreviewContainer: {
      display:"flex",
      flexDirection: 'row',
      flexWrap: 'wrap',
      justifyContent: 'space-between',
      padding:SW(10),
      position:"absolute",
      right:SW(260),
      top:SH(320)
    },
    imagePreview: {
      width: '100%',
      height: SH(90),
      marginBottom: SH(10),
      borderRadius: 10,
    },
    viewMoreOverlay: {
      position: 'absolute',
      right: SH(10),
      bottom: SH(10),
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      padding: SW(10),
      borderRadius: 5,
      justifyContent: 'center',
      alignItems: 'center',
    },
    viewMoreText: {
      color: '#fff',
      fontWeight: 'bold',
      fontSize: SF(16),
    },
    modalContainer: {
      flex: 1,
      backgroundColor: '#000',
    },
    fullImage: {
      width: '100%',
      height: SH(300),
      resizeMode: 'contain',
      marginBottom: SH(10),
    },
    closeButton: {
      position: 'absolute',
      bottom: SH(20),
      alignSelf: 'center',
      backgroundColor: '#fff',
      padding: SW(10),
      borderRadius: 10,
    },
    closeButtonText: {
      fontSize: SF(16),
      fontWeight: 'bold',
    },
    BottomContainer:{
      position:"absolute",
      display:"flex",
      flexDirection:"column",
      justifyContent:"space-around",
    top:SH(350),
    left:SW(270)
    },
    animatedContainer: {
      width: '100%',
      alignItems: 'center',
    },
    image: {
      width: '95%',
      height: SH(180),
      marginVertical:SH(10),
      borderRadius: 10,
      resizeMode: 'cover',
    },
  });

  export default styles
  