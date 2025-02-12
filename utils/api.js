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

