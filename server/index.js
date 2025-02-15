const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs'); // Подключаем bcryptjs
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

// Регистрация пользователя (с хешированием пароля)
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
    // Хешируем пароль
    const hashedPassword = await bcrypt.hash(password, 10);

    const result = await pool.query(
      'INSERT INTO users (name, email, password) VALUES ($1, $2, $3) RETURNING *',
      [name, email, hashedPassword]
    );

    console.log(`✅ Новый пользователь зарегистрирован: ${name} (${email})`);
    res.status(201).json({ message: 'Пользователь зарегистрирован' });
  } catch (error) {
    console.error(`❌ Ошибка при регистрации: ${error.message}`);
    res.status(500).json({ error: 'Ошибка при регистрации' });
  }
});


// Вход пользователя (с проверкой хешированного пароля)
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

    // Проверяем введенный пароль с хешем из базы
    const isMatch = await bcrypt.compare(password, user.password);
    
    if (!isMatch) {
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




// Выход пользователя
app.post('/logout', (req, res) => {
  // Очистка сессии или токена
  res.json({ message: 'Выход выполнен успешно' });
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





// Обновление имени пользователя
app.patch('/update-name', async (req, res) => {
  const { oldName, newName } = req.body;

  if (!oldName || !newName) {
    return res.status(400).json({ error: 'Старое и новое имя обязательны' });
  }

  if (newName.length < 3) {
    return res.status(400).json({ error: 'Имя должно содержать минимум 3 символа' });
  }

  try {
    const result = await pool.query(
      'UPDATE users SET name = $1 WHERE name = $2 RETURNING *',
      [newName, oldName]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Пользователь не найден' });
    }

    console.log(`✅ Имя пользователя обновлено: ${oldName} → ${newName}`);
    res.json({ message: 'Имя успешно обновлено', user: result.rows[0] });
  } catch (error) {
    console.error(`❌ Ошибка при обновлении имени: ${error.message}`);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});


// Обновление email пользователя
app.put('/update-email', async (req, res) => {
  const { name, newEmail } = req.body;

  if (!name || !newEmail) {
    return res.status(400).json({ error: 'Имя и новый email обязательны' });
  }

  if (!validateEmail(newEmail)) {
    return res.status(400).json({ error: 'Неверный формат email' });
  }

  try {
    const result = await pool.query(
      'UPDATE users SET email = $1 WHERE name = $2 RETURNING *',
      [newEmail, name]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Пользователь не найден' });
    }

    console.log(`✅ Email обновлен для ${name}: ${newEmail}`);
    res.json({ message: 'Email успешно обновлен', user: result.rows[0] });
  } catch (error) {
    console.error('❌ Ошибка при обновлении email:', error);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});



// Обновление пароля пользователя
app.patch('/update-password', async (req, res) => {
  const { name, newPassword } = req.body;

  if (!name || !newPassword) {
    return res.status(400).json({ error: 'Имя и новый пароль обязательны' });
  }

  if (newPassword.length < 8) {
    return res.status(400).json({ error: 'Пароль должен содержать минимум 8 символов' });
  }

  try {
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    const result = await pool.query(
      'UPDATE users SET password = $1 WHERE name = $2 RETURNING *',
      [hashedPassword, name]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Пользователь не найден' });
    }

    console.log(`✅ Пароль обновлен для пользователя ${name}`);
    res.json({ message: 'Пароль успешно обновлен' });
  } catch (error) {
    console.error('❌ Ошибка при обновлении пароля:', error);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});





// Получение id пользователя по имени
app.get('/get-id-by-name', async (req, res) => {
  const { name } = req.query;

  if (!name) {
    console.log("Ошибка: имя не передано");
    return res.status(400).json({ error: 'Имя не передано' });
  }

  try {
    const result = await pool.query('SELECT id FROM users WHERE name = $1', [name]);

    if (result.rows.length > 0) {
      console.log(`Найден пользователь с именем ${name}, ID: ${result.rows[0].id}`);
      res.json({ id: result.rows[0].id });
    } else {
      console.log(`Пользователь с именем ${name} не найден`);
      res.status(404).json({ error: 'Пользователь не найден' });
    }
  } catch (error) {
    console.error('Ошибка при запросе id:', error);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});



// Добавление заметки
app.post('/add-note', async (req, res) => {
  const { id, content, date } = req.body;

  if (!id || !content || !date) {
    return res.status(400).json({ error: 'Все поля обязательны' });
  }

  try {
    const existingNote = await pool.query(
      'SELECT content FROM notes WHERE id = $1 AND date = $2',
      [id, date]
    );

    if (existingNote.rows.length > 0) {
      // Объединяем списки и удаляем дубликаты
      const updatedContent = JSON.stringify(
        Array.from(new Set([...JSON.parse(existingNote.rows[0].content), ...JSON.parse(content)]))
      );

      const result = await pool.query(
        'UPDATE notes SET content = $1 WHERE id = $2 AND date = $3 RETURNING *',
        [updatedContent, id, date]
      );

      console.log(`✅ Обновлена заметка для пользователя с ID: ${id}`);
      res.status(200).json({ message: 'Заметка обновлена', note: result.rows[0] });
    } else {
      const result = await pool.query(
        'INSERT INTO notes (id, content, date) VALUES ($1, $2, $3) RETURNING *',
        [id, content, date]
      );

      console.log(`✅ Добавлена новая заметка для пользователя с ID: ${id}`);
      res.status(201).json({ message: 'Заметка добавлена', note: result.rows[0] });
    }
  } catch (error) {
    console.error('❌ Ошибка при добавлении/обновлении заметки:', error);
    res.status(500).json({ error: 'Ошибка сервера при добавлении/обновлении заметки' });
  }
});






// Получение заметки по дате для конкретного пользователя
app.get('/get-note', async (req, res) => {
  const { id, date } = req.query;

  if (!id || !date) {
    return res.status(400).json({ error: 'ID пользователя и дата обязательны' });
  }

  try {
    const result = await pool.query(
      'SELECT content FROM notes WHERE id = $1 AND date = $2',
      [id, date]
    );

    if (result.rows.length > 0) {
      // Если заметка найдена, возвращаем её
      res.json({ content: result.rows[0].content });
    } else {
      // Если заметки нет, возвращаем пустое значение
      res.json({ content: '' });
    }
  } catch (error) {
    console.error('Ошибка при получении заметки:', error);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});




// Получение заметок за неделю для конкретного пользователя
app.get('/get-week-notes', async (req, res) => {
  const { id, startDate, endDate } = req.query;

  if (!id || !startDate || !endDate) {
    return res.status(400).json({ error: 'ID пользователя, начальная и конечная дата обязательны' });
  }

  // Функция для установки фиксированного времени (например, 21:00:00)
  const setFixedTime = (dateString) => {
    const date = new Date(dateString);  // Преобразуем строку в объект Date
    date.setHours(21, 0, 0, 0);  // Устанавливаем время на 21:00:00 (0 миллисекунд)
    return date.toISOString().split('T')[0];  // Возвращаем только дату в формате YYYY-MM-DD
  };

  try {
    const result = await pool.query(
      'SELECT content, date FROM notes WHERE id = $1 AND date BETWEEN $2 AND $3',
      [id, startDate, endDate]
    );

    if (result.rows.length > 0) {
      const notes = result.rows.reduce((acc, row) => {
        const formattedDate = setFixedTime(row.date);  // Устанавливаем фиксированное время
        acc[formattedDate] = row.content;
        return acc;
      }, {});

      res.json({ data: notes });  // Отправляем на клиент данные с фиксированным временем
    } else {
      res.json({ data: {} });
    }
  } catch (error) {
    console.error('Ошибка при получении заметок:', error);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});






// Запуск сервера
app.listen(PORT, () => {
  console.log(`🚀 Сервер запущен на http://localhost:${PORT}`);
});
