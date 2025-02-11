import React, { useState } from 'react';
import { View, Text, TextInput , Image, TouchableOpacity, StyleSheet, StatusBar, Alert } from 'react-native';
import { useFonts } from 'expo-font';

export default function EditNameScreen({ navigation, route }) {
  const [fontsLoaded] = useFonts({
    'Rubik-ExtraBold': require('../assets/fonts/rubik-extrabold.ttf'),
  });

  if (!fontsLoaded) {
    return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Text>Загрузка...</Text>
    </View>
    );
  }

  // Получаем email из параметров навигации
  const { name } = route.params;

  const handlePreviousPage = () => {
    navigation.navigate('Profile', { name });
  };

  return (
    <View style={styles.container}>
      <StatusBar translucent backgroundColor="transparent" barStyle="dark-content" />
      <View style={styles.header}>
        <View style={styles.buttonsContainer}>
          <TouchableOpacity style={styles.button} onPress={handlePreviousPage}>
            <Text style={styles.buttonText}>{'<'}</Text>
          </TouchableOpacity>
        </View>
        <Text style={styles.username}>{name}</Text>
      </View>

      <View style={styles.containerData}>
        <Text style={styles.text}>Введите новый логин</Text>
        <TextInput
        style={styles.input}
        placeholder={name}
        placeholderTextColor="#000"
        />
              
        <TouchableOpacity style={styles.buttonConfirm}>
            <Text style={styles.buttonTextConfirm}>Изменить</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 120,
    backgroundColor: 'white',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    zIndex: 10,
    justifyContent: 'center', // Центрируем элементы по вертикали
  },
  containerData: {
    flex: 1,
    top: -100,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 160,
    paddingHorizontal: 20,
  },
  
  button: {
    position: 'absolute', // Фиксируем позицию кнопки
    top: 0, // Регулируем отступ сверху
    left: 10, // Прижимаем к левому краю
    width: 50,
    height: 50,
    borderRadius: 30,
    backgroundColor: 'black',
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    fontSize: 24,
  },
  username: {
    position: 'absolute',
    alignSelf: 'center',
    textAlign: 'center',
    top: 57,
    fontFamily: 'Roboto_700Bold',
    fontSize: 25,
    color: 'white',
    backgroundColor: 'black',
    paddingVertical: 10, // Вертикальные отступы
    paddingHorizontal: 20, // Горизонтальные отступы
    borderRadius: 30, // Скругление углов
  },
   
  input: {
    backgroundColor: '#fff',
    borderWidth: 2,
    borderColor: '#000',
    width: '80%',
    padding: 15,
    borderRadius: 25,
    textAlign: 'center',
    fontSize: 18,
    color: '#000',
  },
  buttonConfirm: {
    backgroundColor: '#000',
    width: '80%',
    padding: 15,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
  },
  buttonTextConfirm: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  text: {
    fontFamily: 'Roboto_700Bold',
    fontSize: 24,
    color: 'white',
    backgroundColor: 'black',
    marginBottom: 10,
    paddingVertical: 10, // Вертикальные отступы
    paddingHorizontal: 20, // Горизонтальные отступы
    borderRadius: 20, // Скругление углов
  }
});