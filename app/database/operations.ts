import { SQLiteDatabase } from "expo-sqlite"; 
// Тип базы данных SQLite, используемый в Expo

import { Marker, MarkerImage } from "../types"; 
// Типы TypeScript для маркеров и изображений

// Функция добавления нового маркера в базу
export const addMarker = async (
  db: SQLiteDatabase,   // Объект базы данных
  latitude: number,     // Широта нового маркера
  longitude: number     // Долгота нового маркера
) => {
  const result = await db.runAsync(
    `INSERT INTO markers (latitude, longitude) VALUES (?, ?)`, // SQL-запрос вставки
    [latitude, longitude]                                       // Параметры запроса
  );

  return result.lastInsertRowId; // Возвращаем id нового маркера (используется для привязки изображений)
};

// Функция удаления маркера по id
export const deleteMarker = async (db: SQLiteDatabase, id: number) => {
  await db.runAsync(
    `DELETE FROM markers WHERE id = ?`, // SQL-запрос удаления
    [id]                                // Параметр запроса
  );
};

// Получение всех маркеров из базы
export const getMarkers = async (db: SQLiteDatabase): Promise<Marker[]> => {
  return await db.getAllAsync<Marker>(`SELECT * FROM markers`); 
  // getAllAsync — вспомогательный метод для получения массива объектов указанного типа
};

// Добавление изображения к конкретному маркеру
export const addImage = async (
  db: SQLiteDatabase,  // База данных
  markerId: number,    // ID маркера, к которому привязываем изображение
  uri: string          // URI изображения
) => {
  await db.runAsync(
    `INSERT INTO marker_images (marker_id, uri) VALUES (?, ?)`, // SQL-запрос вставки
    [markerId, uri]                                             // Параметры запроса
  );
};

// Удаление изображения по id
export const deleteImage = async (db: SQLiteDatabase, id: number) => {
  await db.runAsync(
    `DELETE FROM marker_images WHERE id = ?`, // SQL-запрос удаления
    [id]                                      // Параметр запроса
  );
};

// Получение всех изображений для конкретного маркера
export const getMarkerImages = async (
  db: SQLiteDatabase,   // База данных
  markerId: number      // ID маркера, для которого нужны изображения
): Promise<MarkerImage[]> => {
  return await db.getAllAsync<MarkerImage>(
    `SELECT * FROM marker_images WHERE marker_id = ?`, // SQL-запрос выборки
    [markerId]                                         // Параметр запроса
  );
};