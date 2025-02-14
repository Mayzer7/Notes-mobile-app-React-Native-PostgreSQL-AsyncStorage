import React, { useState, useEffect} from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet, StatusBar, Alert } from 'react-native';
import { useFonts } from 'expo-font';
import { logoutUser } from '../utils/api';
import { CommonActions } from '@react-navigation/native';

export default function ProfileScreen({ navigation, route }) {
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

  useEffect(() => {
    const fetchEmail = async () => {
      try {
        const response = await fetch(`http://192.168.0.104:3000/get-email?name=${name}`);
        const data = await response.json();
        if (data.email) {
          setEmail(data.email);
        } else {
          Alert.alert('Ошибка', 'Email не найден');
        }
      } catch (error) {
        console.error('Ошибка получения email:', error);
        Alert.alert('Ошибка', 'Не удалось получить email');
      }
    };

    fetchEmail();
  }, [name]);

  // Получаем email из параметров навигации
  const { name } = route.params;
  const [email, setEmail] = useState('');

  const handlePreviousPage = () => {
    navigation.navigate('Notion', { name });
  };

  const handleEditName = () => {
    navigation.navigate('EditName', { name });
  };

  const handleEditEmail = () => {
    navigation.navigate('EditEmail', { name, email })
  };

  const handleEditPassword = () => {
    navigation.navigate('EditPassword', { name })
  };

  const handleLogout = async () => {
    try {
        const success = await logoutUser();
        if (success) {
            console.log("Выход выполнен успешно");
            
            // Очищаем стек экранов и переходим на экран входа
            navigation.dispatch(
                CommonActions.reset({
                    index: 0,
                    routes: [{ name: 'Email' }],  // Замените 'Email' на экран входа
                })
            );
        } else {
            console.log("Ошибка при выходе");
        }
    } catch (error) {
        console.error("Ошибка выхода:", error.message);
    }
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
        <Text style={styles.accountTitle}>Аккаунт</Text>
        
        <View style={styles.card}>
          <TouchableOpacity style={styles.row} onPress={handleEditName}>
            <Text style={styles.label}>Имя</Text>
            
            <View style={styles.rowRight}>
              <Text style={styles.value}>{name}</Text>
              <Text style={styles.arrow}>{'>'}</Text>
            </View>
          </TouchableOpacity>

          <View style={styles.divider} />
          
          <TouchableOpacity style={styles.row} onPress={handleEditEmail}>
            <Text style={styles.label}>Электронная почта</Text>
            <View style={styles.rowRight}>
              <Text style={styles.value}>{email.split('@')[0] + '@'}</Text>
              <Text style={styles.arrow}>{'>'}</Text>
            </View>
          </TouchableOpacity>

          <View style={styles.divider} />

          <TouchableOpacity style={styles.row} onPress={handleEditPassword}>
            <Text style={styles.label}>Пароль</Text>
            <View style={styles.rowRight}>
              <Text style={styles.value}>●●●●●●●●</Text>
              <Text style={styles.arrow}>{'>'}</Text>
            </View>
          </TouchableOpacity>
        </View>

        <TouchableOpacity onPress={handleLogout}>
          <Text style={styles.exit}>Выйти из аккаунта</Text>
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
  containerData: {
    marginTop: 160,
    paddingHorizontal: 20,
  },
  
  accountTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'black',
    marginBottom: 10,
  },
  
  card: {
    backgroundColor: '#E6D9F3', // Светло-фиолетовый фон
    borderRadius: 20,
    padding: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },

  rowRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  
  arrow: {
    fontSize: 18,
    color: 'gray',
    marginLeft: 8,
  },
  
  label: {
    fontSize: 16,
    color: 'black',
  },
  
  value: {
    fontSize: 16,
    color: 'gray',
  },
  
  divider: {
    height: 2,
    backgroundColor: 'gray',
    opacity: 0.3,
    marginVertical: 5,
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
  exit: {
    alignSelf: 'center',
    textAlign: 'center',
    marginTop: 20,
    fontFamily: 'Roboto_700Bold',
    fontSize: 25,
    color: 'white',
    backgroundColor: 'black',
    paddingVertical: 10, // Вертикальные отступы
    paddingHorizontal: 20, // Горизонтальные отступы
    borderRadius: 30, // Скругление углов
  },
  account: {
    position: 'absolute',
    textAlign: 'center',
    top: 130,
    left: 20,
    fontFamily: 'Roboto_700Bold',
    fontSize: 25,
    color: 'red',
    backgroundColor: 'black',
    paddingVertical: 10, // Вертикальные отступы
    paddingHorizontal: 20, // Горизонтальные отступы
    borderRadius: 30, // Скругление углов
  }
});