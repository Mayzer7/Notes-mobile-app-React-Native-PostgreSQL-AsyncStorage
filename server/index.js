const express = require('express');
const cors = require('cors');
const { pool } = require('./db');

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

let requestCount = 0; // Счетчик запросов

// Логирование всех запросов
app.use((req, res, next) => {
  requestCount++; // Увеличиваем счетчик
  console.log(`[${new Date().toLocaleString()}] ${req.method} ${req.path} (Запросов: ${requestCount})`);
  next();
});

// Валидация email
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

  if (!validateEmail(email)) {
    return res.status(400).json({ error: 'Неверный формат email' });
  }

  if (!validatePassword(password)) {
    return res.status(400).json({ error: 'Пароль должен быть не менее 8 символов' });
  }

  try {
    const result = await pool.query(
      'INSERT INTO users (name, email, password) VALUES ($1, $2, $3) RETURNING *',
      [name, email, password]
    );
    console.log(`✅ Новый пользователь зарегистрирован: ${name} (${email})`);
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error(`❌ Ошибка при регистрации: ${error.message}`);
    res.status(500).json({ error: 'Ошибка при регистрации' });
  }
});

// Маршрут для входа
app.post('/login', async (req, res) => {
  const { name, password } = req.body;

  if (!name || !password) {
    return res.status(400).json({ error: 'Логин и пароль обязательны' });
  }

  try {
    const result = await pool.query('SELECT * FROM users WHERE name = $1', [name]);

    if (result.rows.length === 0) {
      console.log(`❌ Попытка входа: пользователь ${name} не найден`);
      return res.status(404).json({ error: 'Пользователь не найден' });
    }

    const user = result.rows[0];

    if (user.password !== password) {
      console.log(`❌ Неверный пароль для пользователя ${name}`);
      return res.status(401).json({ error: 'Неверный пароль' });
    }

    console.log(`✅ Успешный вход: ${name}`);
    res.status(200).json({ message: 'Успешный вход', user });
  } catch (error) {
    console.error(`❌ Ошибка при авторизации: ${error.message}`);
    res.status(500).json({ error: 'Ошибка при авторизации' });
  }
});







// Получение email адреса пользователя из бд для изменения в профиле
app.get('/get-email', async (req, res) => {
  const { name } = req.query;

  if (!name) {
    return res.status(400).json({ error: 'Имя не передано' });
  }

  try {
    const result = await pool.query('SELECT email FROM users WHERE name = $1', [name]);

    if (result.rows.length > 0) {
      res.json({ email: result.rows[0].email });
    } else {
      res.status(404).json({ error: 'Пользователь не найден' });
    }
  } catch (error) {
    console.error('Ошибка при запросе email:', error);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});














// Запуск сервера
app.listen(PORT, () => {
  console.log(`🚀 Сервер запущен на http://localhost:${PORT}`);
});
