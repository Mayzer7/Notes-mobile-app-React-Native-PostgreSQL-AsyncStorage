import AsyncStorage from '@react-native-async-storage/async-storage';

// Регистрация пользователя
export const registerUser = async (name, email, password) => {
    const response = await fetch('http://192.168.0.104:3000/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ name, email, password }),
    });
  
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Ошибка при регистрации');
    }
  
    return await response.json();
  };
  

// Вход пользователя
export const loginUser = async (name, password) => {
  const response = await fetch('http://192.168.0.104:3000/login', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ name, password }),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || 'Ошибка при входе');
  }

  return await response.json();
};


// Выход из аккаунта пользователя
export const logoutUser = async () => {
  const response = await fetch('http://192.168.0.104:3000/logout', {
      method: 'POST',
      headers: {
          'Content-Type': 'application/json',
      },
  });

  const textResponse = await response.text(); // Получаем ответ как текст
  console.log("Ответ от сервера:", textResponse); // Логируем ответ сервера

  try {
      const data = JSON.parse(textResponse); // Пробуем распарсить как JSON
      if (!response.ok) {
          throw new Error(data.error || 'Ошибка при выходе');
      }
      return true;
  } catch (error) {
      console.error('Ошибка при разборе JSON:', error);
      return false;
  }
};




// Обновление имени пользователя
export const updateUserName = async (oldName, newName) => {
  const response = await fetch('http://192.168.0.104:3000/update-name', {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ oldName, newName }),
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error || 'Ошибка при изменении имени');
  }

  return data;
};



// Обновление почты пользователя
export const updateEmail = async (name, newEmail) => {
  const response = await fetch('http://192.168.0.104:3000/update-email', {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ name, newEmail }),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || 'Ошибка при обновлении email');
  }

  return await response.json();
};


// Обновление пароля пользователя
export const updatePassword = async (name, newPassword) => {
  const response = await fetch('http://192.168.0.104:3000/update-password', {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ name, newPassword }),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || 'Ошибка при обновлении пароля');
  }

  return await response.json();
};


// Добавление заметки
export const addNote = async (id, content, date) => {
  const response = await fetch('http://192.168.0.104:3000/add-note', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ id, content, date }),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || 'Ошибка при добавлении заметки');
  }

  // Очищаем весь кеш после успешного добавления заметки
  await AsyncStorage.clear();

  return await response.json();
};


// Получение id пользователя по имени
export const getUserIdByName = async (name) => {
  if (!name) {
    throw new Error('Имя не передано');
  }

  const cacheKey = `userId_${name}`;

  try {
    // Проверяем кеш
    const cachedId = await AsyncStorage.getItem(cacheKey);
    if (cachedId) {
      console.log(`ID пользователя из кеша: ${cachedId}`);
      return { id: cachedId };
    }

    // Если в кеше нет, делаем запрос
    const response = await fetch(`http://192.168.0.104:3000/get-id-by-name?name=${name}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const textResponse = await response.text();
    console.log("Ответ от сервера:", textResponse);

    const data = JSON.parse(textResponse);

    if (data.error) {
      throw new Error(data.error);
    }

    // Сохраняем ID в кеш
    await AsyncStorage.setItem(cacheKey, data.id.toString());

    console.log("ID пользователя:", data.id);
    return data;
  } catch (error) {
    console.error('Ошибка:', error.message);
    throw new Error(error.message);
  }
};


// Получение заметок на всю неделю
export const getNotesForWeek = async (userId, startDate, endDate) => {
  const cacheKey = `notes_${userId}_${startDate}_${endDate}`;

  try {
    // Проверяем кеш
    const cachedNotes = await AsyncStorage.getItem(cacheKey);
    if (cachedNotes) {
      console.log(`Заметки из кеша: ${cacheKey}`, JSON.parse(cachedNotes));
      return { data: JSON.parse(cachedNotes) }; // Возвращаем объект с ключом data, как в оригинале
    }

    // Если кеша нет, запрашиваем данные с сервера
    const response = await fetch(`http://192.168.0.104:3000/get-week-notes?id=${userId}&startDate=${startDate}&endDate=${endDate}`);
    
    const textResponse = await response.text();
    console.log('Ответ от сервера:', textResponse);

    const data = JSON.parse(textResponse);

    if (data.data) {
      // Сохраняем в кеш именно `data.data`, а не весь объект
      await AsyncStorage.setItem(cacheKey, JSON.stringify(data.data));
    }

    return data; // Возвращаем данные в том же формате, что и оригинальная функция
  } catch (error) {
    console.error('Ошибка при получении заметок:', error);
    return { data: {} }; // Возвращаем пустой объект внутри data, чтобы избежать ошибок на клиенте
  }
};

