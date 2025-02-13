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





// Получение id пользователя по имени
export const getUserIdByName = async (name) => {
  if (!name) {
    throw new Error('Имя не передано');
  }

  const response = await fetch(`http://192.168.0.104:3000/get-id-by-name?name=${name}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  const textResponse = await response.text(); // Получаем ответ как текст
  console.log("Ответ от сервера:", textResponse); // Логируем ответ сервера

  try {
    const data = JSON.parse(textResponse); // Парсим ответ вручную

    if (data.error) {
      throw new Error(data.error); // Если ошибка в ответе, выбрасываем её
    }

    console.log("ID пользователя:", data.id); // Логируем ID
    return data; // Возвращаем данные, если всё ок
  } catch (error) {
    console.error('Ошибка:', error.message); // Логируем ошибку
    throw new Error(error.message); // Генерируем ошибку для обработки на клиенте
  }
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

  return await response.json();
};