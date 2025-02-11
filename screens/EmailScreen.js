import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { loginUser } from '../utils/api';

export default function EmailScreen({ navigation }) {
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');

  const handleRegistration = () => {
    // Переход на экран для ввода Регистрации
    navigation.navigate('Registration');  // Переход на Registration
  };

  // Изменение заголовка и стиля текста в верхней панели
  useEffect(() => {
    navigation.setOptions({
      title: 'Привет!',
      headerTitleStyle: {
        fontFamily: 'Rubik-ExtraBold', // Шрифт заголовка
        fontSize: 24,                 // Размер текста заголовка
        color: '#000',                // Цвет заголовка
        marginLeft: 5,
      },
      headerStyle: {
        backgroundColor: '#e0e0e0',   // Цвет фона панели
      },
      headerLeft: () => (
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={{ marginLeft: 20 }} // Отступ для кнопки
        >
          <Text
            style={{
              fontFamily: 'Rubik-ExtraBold', // Жирный шрифт
              fontSize: 30,                 // Размер стрелки
              color: '#000',                // Цвет стрелки
            }}
          >
            {'<'}
          </Text>
        </TouchableOpacity>
      ),
      headerRight: () => (
        <TouchableOpacity
          onPress={handleRegistration}
          style={{ marginRight: 20 }} // Отступ для кнопки
        >
          <Text
            style={{
              fontFamily: 'Rubik-ExtraBold', // Шрифт заголовка
              fontSize: 24,                 // Размер текста заголовка
              color: '#000',                // Цвет заголовка
            }}
          >
            Регистрация
          </Text>
        </TouchableOpacity>
      ),
    });
  }, [navigation]);

  const handleLogin = async () => {
    if (name && password) {
      try {
        const result = await loginUser(name, password);
        // Alert.alert(result.message); // Выводим сообщение об успешном входе
        navigation.navigate('Notion', {name: name}); // Переходим на другой экран
      } catch (error) {
        Alert.alert(error.message); // Выводим сообщение об ошибке
      }
    } else {
      Alert.alert('Введите корректные данные');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Вход через Email</Text>
      
      <TextInput
        style={styles.input}
        placeholder="Введите Логин"
        value={name}
        onChangeText={setName}
        placeholderTextColor="#000"
      />
      
      <TextInput
        style={styles.input}
        placeholder="Введите пароль"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        placeholderTextColor="#000"
      />
      
      <TouchableOpacity style={styles.button} onPress={handleLogin}>
        <Text style={styles.buttonText}>Войти</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#e0e0e0',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#000',
  },
  input: {
    backgroundColor: '#fff',
    borderWidth: 2,
    borderColor: '#000',
    width: '80%',
    padding: 15,
    borderRadius: 25,
    marginBottom: 10,
    textAlign: 'center',
    fontSize: 18,
    color: '#000',
  },
  button: {
    backgroundColor: '#000',
    width: '80%',
    padding: 15,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});