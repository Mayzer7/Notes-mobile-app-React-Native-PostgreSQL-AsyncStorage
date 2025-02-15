import React, { useState, useEffect, useMemo } from 'react';
import { StyleSheet, Text, View, StatusBar, TextInput, ScrollView, TouchableOpacity, Image } from 'react-native';
import { useFonts } from 'expo-font';
import { Roboto_700Bold } from '@expo-google-fonts/roboto';
import { format, addDays, startOfWeek, setHours, setMinutes, setSeconds } from 'date-fns';
import { ru } from 'date-fns/locale';
import { getUserIdByName, addNote, getNotesForWeek } from '../utils/api';

import Icon from 'react-native-vector-icons/MaterialIcons';

export default function Notion({ navigation, route }) {
  let [fontsLoaded] = useFonts({
    Roboto_700Bold,
  });

  const { name } = route.params;
  const [userId, setUserId] = useState(null); // Состояние для хранения userId
  const [currentDate, setCurrentDate] = useState(startOfWeek(new Date(), { weekStartsOn: 1 }));
  const [notes, setNotes] = useState({});
  const [addedNotes, setAddedNotes] = useState({}); // Состояние для отслеживания добавленных заметок
  const [completedTasks, setCompletedTasks] = useState({});

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
  
  // Загружаем заметки при изменении даты
  useEffect(() => {
    if (userId) {
      fetchNotes(); // Загружаем заметки только после получения userId
    }
  }, [currentDate, userId]);


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
      const formattedDate = format(setHours(setMinutes(setSeconds(date, 0), 0), 0), 'yyyy-MM-dd');
  
      try {
        formattedNotes[formattedDate] = JSON.parse(notesData[key]) || [""]; // Парсим JSON, если это массив
      } catch {
        formattedNotes[formattedDate] = [notesData[key] || ""]; // Если ошибка — просто строка
      }
    }
    return formattedNotes;
  };

  // Функция для получения заметок за неделю
  const fetchNotes = async () => {
    if (!userId) return;
  
    try {
      const startDate = format(currentDate, 'yyyy-MM-dd');
      const endDate = format(addDays(currentDate, 6), 'yyyy-MM-dd');
      const fetchedNotes = await getNotesForWeek(userId, startDate, endDate);
      let formattedNotes = formatNotes(fetchedNotes?.data || {});
  
      // Гарантируем, что в каждом дне есть хотя бы одна пустая заметка
      daysOfWeek.forEach(({ date }) => {
        if (!formattedNotes[date]) {
          formattedNotes[date] = [""];
        } else if (!formattedNotes[date].includes("")) {
          formattedNotes[date].push("");
        }
      });
  
      setNotes(formattedNotes);
    } catch (error) {
      console.error('Ошибка при загрузке заметок:', error.message);
    }
  };
  


  const handlePrevWeek = () => {
    setCurrentDate(prevDate => addDays(prevDate, -7));
  };

  const handleNextWeek = () => {
    setCurrentDate(prevDate => addDays(prevDate, 7));
  };

  const handleProfile = () => {
    navigation.navigate('Profile', { name });
  };

  const handleBlur = async (date, content, index) => {
    if (!userId || content.trim() === "") return; // Не сохраняем пустые заметки
    
    try {
      const notesForDay = notes[date]?.filter(note => note.trim() !== ""); // Убираем пустые заметки
      await addNote(userId, JSON.stringify(notesForDay), date); // Сохраняем заметки

      // Отмечаем, что заметка добавлена
      setAddedNotes(prevState => ({
        ...prevState,
        [`${date}-${index}`]: true, // Помечаем добавленную заметку
      }));

      console.log(`Заметки на ${date}:`, notesForDay);
    } catch (error) {
      console.error('Ошибка при добавлении заметки:', error.message);
    }
  };
  

  const handleChangeText = (text, date, index) => {
    setNotes(prevNotes => {
      const newNotes = { ...prevNotes };
      
      if (!newNotes[date]) newNotes[date] = [""]; // Если для даты еще нет заметок, создаем массив
      
      newNotes[date][index] = text; // Обновляем текст нужной заметки
  
      // Если пользователь заполнил последний input, добавляем новый пустой
      if (index === newNotes[date].length - 1 && text.trim() !== "") {
        newNotes[date].push("");
      }
  
      return newNotes;
    });
  };

  const toggleTaskCompletion = (date, index) => {
    setCompletedTasks(prevState => ({
      ...prevState,
      [`${date}-${index}`]: !prevState[`${date}-${index}`],
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
          {(notes[date] || [""]).map((note, index) => {
            // Проверяем, есть ли заметки, и не пустые ли они
            const hasNotes = notes[date]?.some(n => n.trim() !== "");

            return (
              <View key={index} style={styles.noteContainer}>
                <TextInput
                  style={styles.input}
                  placeholderTextColor="gray"
                  multiline={false}
                  textAlignVertical="center"
                  value={note}
                  onChangeText={(text) => handleChangeText(text, date, index)}
                  onBlur={() => handleBlur(date, note, index)}
                />
                {hasNotes && ( // Показываем галочку только если есть непустые заметки
                  <TouchableOpacity onPress={() => toggleTaskCompletion(date, index)} style={styles.checkMarkContainer}>
                    <Icon
                      name={completedTasks[`${date}-${index}`] ? "check-circle" : "check-circle-outline"}
                      style={[styles.checkMark, completedTasks[`${date}-${index}`] && styles.completedCheckMark]}
                    />
                  </TouchableOpacity>
                      )}
                    </View>
                  );
                })}
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
  checkMarkContainer: {
    position: 'absolute',
    alignSelf: 'flex-end',
  },
  checkMark: {
    fontSize: 30,
    marginTop: 8,
    marginRight: 5,
  },
  completedCheckMark: {
    color: 'green',
  }
});
