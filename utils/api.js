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
