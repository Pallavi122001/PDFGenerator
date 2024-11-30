import { StyleSheet, Text, View, Image, SafeAreaView } from 'react-native';
import React, { useEffect } from 'react';
import Colors from '../../utils/Colors';
import { SH,SW,SF } from '../../utils/dimensions';

const Splashscreen = ({navigation}) => {
  useEffect(()=>{
    setTimeout(() => {
      navigation.navigate("Home")
    }, 2000);
  })
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Image source={require('../images/AppLogo.png')} style={styles.logo} />
        <Text style={styles.text}>Scan, Save, Share Instantly</Text>
      </View>
    </SafeAreaView>
  );
};

export default Splashscreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor:Colors.white,
  },
  content: {
    justifyContent: 'center',
    alignItems: 'center',
    textAlign: 'center',
  },
  logo: {
    width:SW(300),
    height: SH(150),
    resizeMode:"contain"
  },
  text: {
    fontFamily: 'Poppins-Bold',
    fontSize:SF(20),
    color:Colors.theme,
  },
});
