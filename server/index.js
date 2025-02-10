const express = require('express');
const cors = require('cors');
const { pool } = require('./db');

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

// Валидация email с помощью регулярного выражения
const validateEmail = (email) => {
  const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;
  return emailRegex.test(email);
};

// Валидация пароля (минимум 8 символов)
const validatePassword = (password) => {
  return password.length >= 8;
};

// Маршрут регистрации
app.post('/register', async (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ error: 'Все поля обязательны' });
  }

  // Проверка email
  if (!validateEmail(email)) {
    return res.status(400).json({ error: 'Неверный формат email' });
  }

  // Проверка пароля
  if (!validatePassword(password)) {
    return res.status(400).json({ error: 'Пароль должен быть не менее 8 символов' });
  }

  try {
    const result = await pool.query(
      'INSERT INTO users (name, email, password) VALUES ($1, $2, $3) RETURNING *',
      [name, email, password]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Ошибка при регистрации' });
  }
});

// Маршрут для входа
app.post('/login', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email и пароль обязательны' });
  }

  // Проверка email
  if (!validateEmail(email)) {
    return res.status(400).json({ error: 'Неверный формат email' });
  }

  try {
    // Проверяем, существует ли пользователь с таким email
    const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Пользователь не найден' });
    }

    const user = result.rows[0];

    // Проверяем пароль (если нужно, тут можно использовать bcrypt для хэширования паролей)
    if (user.password !== password) {
      return res.status(401).json({ error: 'Неверный пароль' });
    }

    // Если все проверки прошли, отправляем информацию о пользователе
    res.status(200).json({ message: 'Успешный вход', user });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Ошибка при авторизации' });
  }
});

// Сервер работает)))
app.listen(PORT, () => {
  console.log(`Сервер запущен на http://localhost:${PORT}`);
});
