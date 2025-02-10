import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { registerUser } from '../utils/api'; // Подключение функции регистрации

export default function RegistrationScreen({ navigation }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  useEffect(() => {
    navigation.setOptions({
      title: 'Регистрация',
      headerTitleStyle: {
        fontFamily: 'Rubik-ExtraBold',
        fontSize: 24,
        color: '#000',
        marginLeft: 5,
      },
      headerStyle: {
        backgroundColor: '#e0e0e0',
      },
      headerLeft: () => (
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={{ marginLeft: 20 }}
        >
          <Text
            style={{
              fontFamily: 'Rubik-ExtraBold',
              fontSize: 30,
              color: '#000',
            }}
          >
            {'<'}
          </Text>
        </TouchableOpacity>
      ),
    });
  }, [navigation]);

  const handleRegistration = async () => {
    if (name && email && password) {
      try {
        await registerUser(name, email, password);
        Alert.alert('Регистрация выполнена');
        navigation.navigate('Email');
      } catch (error) {
        Alert.alert('Ошибка регистрации', error.message);
      }
    } else {
      Alert.alert('Пожалуйста, заполните все поля');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Регистрация</Text>

      <TextInput
        style={styles.input}
        placeholder="Введите имя"
        value={name}
        onChangeText={setName}
        placeholderTextColor="#000"
      />

      <TextInput
        style={styles.input}
        placeholder="Введите Email"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
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

      <TouchableOpacity style={styles.button} onPress={handleRegistration}>
        <Text style={styles.buttonText}>Зарегистрироваться</Text>
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
