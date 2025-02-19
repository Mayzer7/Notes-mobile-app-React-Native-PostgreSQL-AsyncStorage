import React, { useState } from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { useFonts } from 'expo-font';

export default function AuthScreen({ navigation }) {
  const [fontsLoaded] = useFonts({
    'Rubik-ExtraBold': require('../assets/fonts/rubik-extrabold.ttf'),
  });

  if (!fontsLoaded) {
      return (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', fontSize: 40, }}>
          <Text>Загрузка...</Text>
        </View>
      );
    }

  const handleGoogleLogin = () => {
    // Логика аутентификации через Google
    Alert.alert('Вход через Google');
  };

  const handleEmailLogin = () => {
    // Логика аутентификации через Email
    navigation.navigate('Email');
  };

  return (
    <View style={styles.container}>
      {/* Логотип */}
      <Image source={require('../assets/images/notes-logo.png')} style={styles.logo} />

      {/* Кнопки */}
      {/* <TouchableOpacity style={styles.button} onPress={handleGoogleLogin}>
        <View style={styles.buttonContent}>
          <Image source={require('../assets/images/google-icon.png')} style={styles.googleLogo} />
          <Text style={styles.buttonText}>Войти через Google</Text>
        </View>
      </TouchableOpacity> */}

      <TouchableOpacity style={styles.buttonOutline} onPress={handleEmailLogin}>
        <View style={styles.buttonContent}>
          <Image source={require('../assets/images/google-icon.png')} style={styles.googleLogo} />
          <Text style={styles.buttonTextGoogle}>Войти через Google</Text>
        </View>
      </TouchableOpacity>

      <TouchableOpacity style={styles.buttonOutline} onPress={handleEmailLogin}>
        <Text style={[styles.buttonText, { color: '#000' }]}>Вход в аккаунт</Text> 
      </TouchableOpacity>

      {/* Текст с условиями */}
      {/* <Text style={styles.footerText}>
        Продолжая, вы соглашаетесь с{' '}
        <Text style={styles.linkText}>Условиями использования</Text> и{' '}
        <Text style={styles.linkText}>Политикой конфиденциальности</Text>
      </Text> */}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingBottom: 100,
    backgroundColor: '#e0e0e0', // Цвет фона
  },
  logo: {
    width: 100,
    height: 100,
    marginBottom: 40,
<<<<<<< HEAD
    marginLeft: 20,
=======
    marginLeft: 25,
>>>>>>> baebb02b843c3a2d2f8a165b5306f8dfbccee40d
  },
  button: {
    backgroundColor: 'white',
    width: '80%',
    padding: 15,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonOutline: {
    backgroundColor: '#fff',
    borderWidth: 2,
    borderColor: '#000',
    width: '80%',
    padding: 15,
    borderRadius: 25,
    marginBottom: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonText: {
    fontFamily: 'Rubik-ExtraBold',
    fontSize: 18,
    color: 'black',
  },
  buttonTextGoogle: {
    fontFamily: 'Rubik-ExtraBold',
    fontSize: 18,
    marginRight: 40,
    color: 'black',
  },
  footerText: {
    fontSize: 14,
    color: '#000',
    textAlign: 'center',
    marginTop: 20,
  },
  linkText: {
    color: '#007BFF',
  },
  googleLogo: {
    width: 24,  // Размер логотипа (можно подкорректировать)
    height: 24,
    marginRight: 10,
  },
  buttonContent: {
    flexDirection: 'row', // Расположим элементы в строку
    alignItems: 'center', // Центрируем элементы по вертикали
  },
  footerText: {
    fontSize: 14,
    color: '#000',
    textAlign: 'center',
    marginTop: 20,
  },
  linkText: {
    color: '#007BFF',
  },
});
