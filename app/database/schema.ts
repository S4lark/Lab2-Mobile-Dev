import * as SQLite from "expo-sqlite"; 
// Импортируем модуль Expo SQLite для работы с базой данных на мобильном устройстве

// Функция открытия базы данных или создания новой
export const openDatabase = async () => {
  return await SQLite.openDatabaseAsync("markers.db"); 
  // Открываем (или создаём) базу данных с именем "markers.db"
};

// Функция инициализации базы данных (создание таблиц и включение ограничений)
export const initDatabase = async () => {
  const db = await openDatabase(); 
  // Получаем объект базы данных

  await db.execAsync(` 
    PRAGMA foreign_keys = ON; 
    /* Включаем поддержку внешних ключей, чтобы каскадное удаление работало */

    CREATE TABLE IF NOT EXISTS markers (
      id INTEGER PRIMARY KEY AUTOINCREMENT,        -- Уникальный идентификатор маркера
      latitude REAL NOT NULL,                      -- Широта маркера
      longitude REAL NOT NULL,                     -- Долгота маркера
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP -- Дата и время создания
    );

    CREATE TABLE IF NOT EXISTS marker_images (
      id INTEGER PRIMARY KEY AUTOINCREMENT,       -- Уникальный идентификатор изображения
      marker_id INTEGER NOT NULL,                 -- Ссылка на маркер, к которому привязано изображение
      uri TEXT NOT NULL,                          -- URI изображения
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP, -- Дата и время создания
      FOREIGN KEY (marker_id) REFERENCES markers(id) ON DELETE CASCADE 
      /* Связь с таблицей маркеров, автоматическое удаление изображений при удалении маркера */
    );
  `);

  return db; 
  // Возвращаем объект базы данных для дальнейшего использования
};