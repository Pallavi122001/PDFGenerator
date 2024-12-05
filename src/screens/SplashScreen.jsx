import { StyleSheet, Text, View, SafeAreaView, TouchableOpacity, Animated } from 'react-native';
import React, { useEffect, useRef } from 'react';
import { SH, SW, SF } from '../../utils/dimensions';

const Splashscreen = ({ navigation }) => {
  const slideAnim = useRef(new Animated.Value(-200)).current;

  const GotoHome = () => {
    navigation.navigate("Home");
  };

  useEffect(() => {
    Animated.timing(slideAnim, {
      toValue: 0, 
      duration: 800,
      useNativeDriver: true,
    }).start();
  }, [slideAnim]);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <View style={{ marginTop: SH(200) }}>
          <Animated.Image
            source={require('../images/AppLogo.png')}
            style={[styles.image, { transform: [{ translateY: slideAnim }] }]}
          />
          <Text style={styles.text}>Scan, Save, Share Instantly</Text>
        </View>
        <TouchableOpacity style={styles.button} onPress={GotoHome}>
          <Text style={styles.Buttontext}>Create Pdf</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor:'#fff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    justifyContent: 'center',
    alignItems: 'center',
    textAlign: 'center',
  },
  image: {
    width: SW(300),
    height: SH(150),
    resizeMode: "contain",
  },
  text: {
    fontSize: SF(20),
    color:'#166991',
    fontWeight:"bold",
    marginLeft:SW(20)
  },
  button: {
    backgroundColor:'#166991',
    width: SW(350),
    padding: SW(6),
    borderRadius: 5,
    marginTop: SH(350),
  },
  Buttontext: {
    color:'#fff',
    textAlign: "center",
    textTransform: "uppercase",
  },
});

export default Splashscreen;
