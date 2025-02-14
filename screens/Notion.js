import React, { useState, useEffect, useMemo } from 'react';
import { StyleSheet, Text, View, StatusBar, TextInput, ScrollView, TouchableOpacity, Image } from 'react-native';
import { useFonts } from 'expo-font';
import { Roboto_700Bold } from '@expo-google-fonts/roboto';
import { format, addDays, startOfWeek, setHours, setMinutes, setSeconds } from 'date-fns';
import { ru } from 'date-fns/locale';
import { getUserIdByName, addNote, getNotesForWeek } from '../utils/api';

export default function Notion({ navigation, route }) {
  let [fontsLoaded] = useFonts({
    Roboto_700Bold,
  });

  const { name } = route.params;

  const [userId, setUserId] = useState(null); // Состояние для хранения userId
  const [currentDate, setCurrentDate] = useState(startOfWeek(new Date(), { weekStartsOn: 1 }));
  const [notes, setNotes] = useState({});

  const formattedDate = useMemo(() => {
    let date = format(currentDate, 'MMM yyyy', { locale: ru });
    return date.charAt(0).toUpperCase() + date.slice(1);
  }, [currentDate]);

  const daysOfWeek = useMemo(() => {
    return Array.from({ length: 7 }).map((_, index) => {
      const date = addDays(currentDate, index);
      return {
        formatted: format(date, 'd MMM', { locale: ru }),
        weekday: format(date, 'E', { locale: ru }).slice(0, 2).replace(/^./, str => str.toUpperCase()),
        date: format(date, 'yyyy-MM-dd'),
      };
    });
  }, [currentDate]);

  // Функция для форматирования заметок
  const formatNotes = (notesData) => {
    const formattedNotes = {};
    for (let key in notesData) {
      const date = new Date(key);
      const resetTimeDate = setHours(setMinutes(setSeconds(date, 0), 0), 0);
      const formattedDate = format(resetTimeDate, 'yyyy-MM-dd');
      formattedNotes[formattedDate] = notesData[key];
    }
    return formattedNotes;
  };

  // Получаем userId только один раз при монтировании компонента
  useEffect(() => {
    const fetchUserId = async () => {
      try {
        const userIdData = await getUserIdByName(name);
        setUserId(userIdData.id); // Сохраняем ID в состояние
      } catch (error) {
        console.error('Ошибка при получении ID пользователя:', error.message);
      }
    };

    fetchUserId();
  }, [name]);

  // Функция для получения заметок за неделю
  const fetchNotes = async () => {
    if (!userId) return; // Не запрашиваем заметки, если userId ещё не получен

    try {
      const startDate = format(currentDate, 'yyyy-MM-dd');
      const endDate = format(addDays(currentDate, 6), 'yyyy-MM-dd');
      const fetchedNotes = await getNotesForWeek(userId, startDate, endDate);
      const formattedNotes = formatNotes(fetchedNotes?.data || {});
      setNotes(formattedNotes);
    } catch (error) {
      console.error('Ошибка при загрузке заметок:', error.message);
    }
  };

  // Загружаем заметки при изменении даты
  useEffect(() => {
    if (userId) {
      fetchNotes(); // Загружаем заметки только после получения userId
    }
  }, [currentDate, userId]);

  const handlePrevWeek = () => {
    setCurrentDate(prevDate => addDays(prevDate, -7));
  };

  const handleNextWeek = () => {
    setCurrentDate(prevDate => addDays(prevDate, 7));
  };

  const handleProfile = () => {
    navigation.navigate('Profile', { name });
  };

  const handleBlur = async (date, content) => {
    if (!userId) return; // Если ID пользователя ещё нет, не сохраняем заметку

    try {
      const result = await addNote(userId, content, date);
      const localDate = new Date(result.note.date).toLocaleString('ru-RU', {
        timeZone: 'Europe/Moscow',
        year: 'numeric', month: '2-digit', day: '2-digit',
        hour: '2-digit', minute: '2-digit', second: '2-digit'
      });
      console.log(`Заметка добавлена: ${content} на ${localDate}`);
    } catch (error) {
      console.error('Ошибка при добавлении заметки:', error.message);
    }
  };

  const handleChangeText = (text, date) => {
    setNotes(prevNotes => ({
      ...prevNotes,
      [date]: text, // Обновляем заметку для конкретного дня
    }));
  };

  if (!fontsLoaded) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text>Загрузка...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar translucent backgroundColor="transparent" barStyle="dark-content" />
      <View style={styles.header}>
        <Text style={styles.dateText}>{formattedDate}</Text>
        <View style={styles.buttonsContainer}>
          <TouchableOpacity style={styles.buttonIcon} onPress={handleProfile}>
            <Image source={require('../assets/images/user-icon.png')} style={styles.userIcon} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.button} onPress={handlePrevWeek}>
            <Text style={styles.buttonText}>{'<'}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.button} onPress={handleNextWeek}>
            <Text style={styles.buttonText}>{'>'}</Text>
          </TouchableOpacity>
        </View>
      </View>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        {daysOfWeek.map(({ formatted, weekday, date }) => (
          <View key={date} style={styles.dayContainer}>
            <View style={styles.dayHeader}>
              <Text style={styles.dayText}>{formatted}</Text>
              <Text style={styles.dayAbbr}>{weekday}</Text>
            </View>
            <View style={styles.line} />
            <TextInput
              style={styles.input}
              placeholderTextColor="gray"
              multiline={false}
              textAlignVertical="center"
              value={notes[date]} // Показываем заметку для конкретного дня
              onChangeText={(text) => handleChangeText(text, date)} // Обновляем заметку для конкретного дня
              onBlur={() => handleBlur(date, notes[date])} // Сохраняем заметку при потере фокуса
            />
          </View>
        ))}
        <View style={{ height: 100 }} />
      </ScrollView>
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
    justifyContent: 'flex-end',
    paddingBottom: 10,
    backgroundColor: 'white',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    zIndex: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dateText: {
    marginTop: 40,
    left: 10,
    fontFamily: 'Roboto_700Bold',
    fontSize: 40,
    color: 'black',
  },
  buttonsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  button: {
    marginTop: 40,
    right: 10,
    width: 50,
    height: 50,
    borderRadius: 30,
    backgroundColor: 'black',
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 3,
  },
  buttonIcon: {
    marginTop: 40,
    right: 10,
    width: 50,
    height: 50,
    borderRadius: 30,
    backgroundColor: '#E6D9F3',
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 3,
  },
  userIcon: {
    width: 30,  // Размер логотипа (можно подкорректировать)
    height: 30,
    marginRight: 1,
  },
  buttonText: {
    color: 'white',
    fontSize: 24,
  },
  scrollContainer: {
    paddingTop: 110,
  },
  dayContainer: {
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  dayHeader: {
    marginTop: 10,
    flexDirection: 'row',
    alignItems: 'center',
  },
  dayAbbr: {
    fontFamily: 'Roboto_700Bold',
    fontSize: 40,
    right: 10,
    color: 'red',
    textAlign: 'right',
    flex: 1,
  },
  dayText: {
    fontFamily: 'Roboto_700Bold',
    fontSize: 40,
    color: 'black',
    marginLeft: 10,
  },
  line: {
    borderBottomWidth: 3,
    borderBottomColor: 'black',
    marginVertical: 10,
  },
  input: {
    minHeight: 50,
    borderBottomWidth: 1,
    borderBottomColor: 'black',
    fontFamily: 'Roboto_700Bold',
    fontSize: 18,
    paddingLeft: 10,
    marginBottom: 10,
    paddingTop: 5,
    paddingBottom: 5,
  },
});
