import React, { useState, useEffect, useMemo, useRef } from 'react';
import { StyleSheet, Text, View, StatusBar, TextInput, ScrollView, TouchableOpacity, Image } from 'react-native';
import { useFonts } from 'expo-font';
import { Roboto_700Bold } from '@expo-google-fonts/roboto';
import { format, addDays, startOfWeek, setHours, setMinutes, setSeconds } from 'date-fns';
import { ru } from 'date-fns/locale';
import { getUserIdByName, addNote, getNotesForWeek } from '../utils/api';

import Icon from 'react-native-vector-icons/MaterialIcons';

import AsyncStorage from '@react-native-async-storage/async-storage';

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
  const today = format(new Date(), 'yyyy-MM-dd');
  const todayWeekday = format(new Date(), 'E', { locale: ru }).slice(0, 2).replace(/^./, str => str.toUpperCase());
  
  const scrollViewRef = useRef(null); // Создаём ref

  const todayRef = useRef(null);


  const [activeNote, setActiveNote] = useState(null);

  const truncateText = (text, maxLength = 25) => {
    return text.length > maxLength ? text.slice(0, maxLength) + "..." : text;
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
  
  // Загружаем заметки при изменении даты
  useEffect(() => {
    if (userId) {
      fetchNotes(); // Загружаем заметки только после получения userId
    }
  }, [currentDate, userId]);


  useEffect(() => {
    if (scrollViewRef.current) {
      setTimeout(() => {
        todayRef.current?.measure((x, y, width, height, pageX, pageY) => {
          scrollViewRef.current.scrollTo({ y: pageY, animated: true });
        });
      }, 300);
    }
  }, [daysOfWeek]);
  

  useEffect(() => {
    const loadCompletedTasks = async () => {
      try {
        const storedTasks = await AsyncStorage.getItem('completedTasks');
        if (storedTasks) {
          setCompletedTasks(JSON.parse(storedTasks));
        }
      } catch (error) {
        console.error('Ошибка загрузки выполненных задач:', error);
      }
    };
  
    loadCompletedTasks();
  }, []);

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
    if (!userId) return;
  
    setNotes(prevNotes => {
      let updatedNotes = { ...prevNotes };
  
      // Удаляем пустую заметку
      updatedNotes[date] = updatedNotes[date].filter((note, i) => !(i === index && note.trim() === ""));
  
      // Если нет пустой строки в конце — добавляем её для новой заметки
      if (updatedNotes[date].length === 0 || updatedNotes[date][updatedNotes[date].length - 1].trim() !== "") {
        updatedNotes[date].push("");
      }
  
      setTimeout(async () => {
        try {
          await addNote(userId, JSON.stringify(updatedNotes[date]), date);
  
          // Отмечаем, что заметка добавлена
          setAddedNotes(prevState => ({
            ...prevState,
            [`${date}-${index}`]: true,
          }));
        } catch (error) {
          console.error('Ошибка при обновлении заметок:', error.message);
        }
      }, 300);
  
      return updatedNotes;
    });
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

  const toggleTaskCompletion = async (date, index) => {
    const newCompletedTasks = {
      ...completedTasks,
      [`${date}-${index}`]: !completedTasks[`${date}-${index}`],
    };
  
    setCompletedTasks(newCompletedTasks);
  
    try {
      await AsyncStorage.setItem('completedTasks', JSON.stringify(newCompletedTasks));
    } catch (error) {
      console.error('Ошибка сохранения выполненных задач:', error);
    }
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
      <ScrollView ref={scrollViewRef} contentContainerStyle={styles.scrollContainer}>
        {daysOfWeek.map(({ formatted, weekday, date }) => (
          <View key={date} ref={date === today ? todayRef : null} style={styles.dayContainer}>
            <View style={styles.dayHeader}>
              <Text style={date === today ? styles.todayText : styles.dayText}>
                {formatted}
              </Text>
              <Text style={date === today ? styles.todayWeekdayText : styles.weekdayText}>
                {weekday}
              </Text>
            </View>
            <View
              style={[
                styles.line,
                { borderBottomColor: date === today ? 'blue' : 'black' }
              ]}
            /> 
            {(notes[date] || [""]).map((note, index) => {
              // Проверяем, есть ли заметки, и не пустые ли они
              const hasNotes = notes[date]?.some(n => n.trim() !== "");

              return (
                <View key={index} style={styles.noteContainer}>
                  <TextInput
                    maxLength={200}
                    style={[
                      styles.input,
                      {
                        textDecorationLine: completedTasks[`${date}-${index}`] ? 'line-through' : 'none',
                        color: completedTasks[`${date}-${index}`] ? 'gray' : 'black',
                      },
                    ]}
                    placeholderTextColor="gray"
                    multiline={false}
                    textAlignVertical="center"
                    value={activeNote === `${date}-${index}` ? note : truncateText(note)}
                    onFocus={() => setActiveNote(`${date}-${index}`)} // Когда фокусируемся, сохраняем ключ заметки
                    onBlur={() => {
                      setActiveNote(null); // Когда убираем фокус, сбрасываем активную заметку
                      handleBlur(date, note, index);
                    }}
                    onChangeText={(text) => handleChangeText(text, date, index)}
                  />

                  {note.trim() !== "" && activeNote !== `${date}-${index}` && ( // Показываем галочку только если заметка не активна
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
  weekdayText: {
    fontFamily: 'Roboto_700Bold',
    fontSize: 40,
    right: 10,
    color: 'red',
    textAlign: 'right',
    flex: 1,
  },
  todayWeekdayText: {
    fontFamily: 'Roboto_700Bold',
    fontSize: 40,
    right: 10,
    color: 'blue',
    textAlign: 'right',
    flex: 1,
  },
  dayText: {
    fontFamily: 'Roboto_700Bold',
    fontSize: 40,
    color: 'black',
    marginLeft: 10,
  },
  todayText: {
    fontFamily: 'Roboto_700Bold',
    fontSize: 40,
    color: 'blue',
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
  },
  completedText: {
    textDecorationLine: 'line-through',
    color: 'gray', // Можно сделать текст серым, чтобы визуально отличался
  },
});
