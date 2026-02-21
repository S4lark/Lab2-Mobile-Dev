import React, { createContext, useContext, useEffect, useState } from "react"; 
// Импортируем React и хуки: createContext для создания контекста, useContext для использования, 
// useEffect для побочных эффектов и useState для состояния

import { SQLiteDatabase } from "expo-sqlite"; 
// Тип базы данных SQLite, используемый в Expo

import { initDatabase } from "../database/schema"; 
// Функция инициализации базы данных (создание таблиц, открытие соединения)

import * as ops from "../database/operations"; 
// Импортируем все операции с базой данных (CRUD) из отдельного модуля

import { Marker, MarkerImage } from "../types"; 
// Типы TypeScript для маркеров и изображений


// Определяем интерфейс контекста базы данных
interface DatabaseContextType {
  addMarker: (lat: number, lon: number) => Promise<void>;            // Добавление нового маркера
  deleteMarker: (id: number) => Promise<void>;                       // Удаление маркера по id
  getMarkers: () => Promise<Marker[]>;                                // Получение всех маркеров
  addImage: (markerId: number, uri: string) => Promise<void>;         // Добавление изображения к маркеру
  deleteImage: (id: number) => Promise<void>;                         // Удаление изображения
  getMarkerImages: (markerId: number) => Promise<MarkerImage[]>;      // Получение изображений для маркера
  isLoading: boolean;                                                 // Флаг загрузки базы
  error: Error | null;                                                // Ошибка, если что-то пошло не так
}

// Создаём контекст базы данных, по умолчанию null
const DatabaseContext = createContext<DatabaseContextType | null>(null);

// Хук для удобного доступа к базе данных из компонентов
export const useDatabase = () => {
  const ctx = useContext(DatabaseContext); 
  if (!ctx) throw new Error("useDatabase must be used inside DatabaseProvider"); 
  // Выбрасываем ошибку, если хук вызван вне провайдера
  return ctx;
};

// Провайдер базы данных — оборачивает приложение и даёт доступ ко всем методам БД
export const DatabaseProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [db, setDb] = useState<SQLiteDatabase | null>(null); // Объект базы данных
  const [isLoading, setIsLoading] = useState(true);           // Флаг загрузки
  const [error, setError] = useState<Error | null>(null);     // Ошибка

  // Инициализация базы данных при первом рендере
  useEffect(() => {
    initDatabase()          // Создаём таблицы и открываем соединение
      .then(setDb)          // Сохраняем объект базы данных в state
      .catch(setError)      // Если ошибка, сохраняем её
      .finally(() => setIsLoading(false)); // Снимаем флаг загрузки
  }, []);

  // Обёртка для безопасного вызова операций с базой и логирования ошибок
  const safeCall = async <T,>(fn: () => Promise<T>) => {
    try {
      return await fn();    // Вызываем переданную функцию
    } catch (err) {
      console.error("DB Error:", err); // Логируем ошибку
      setError(err as Error);           // Сохраняем её в state
      throw err;                        // Пробрасываем дальше
    }
  };

  // Значение контекста, передаваемое в провайдер
  const value: DatabaseContextType = {
    addMarker: (lat, lon) =>
      safeCall(() => ops.addMarker(db!, lat, lon).then(() => {})), // Добавление маркера

    deleteMarker: (id) =>
      safeCall(() => ops.deleteMarker(db!, id)),                   // Удаление маркера

    getMarkers: () =>
      safeCall(() => ops.getMarkers(db!)),                        // Получение всех маркеров

    addImage: (id, uri) =>
      safeCall(() => ops.addImage(db!, id, uri)),                 // Добавление изображения к маркеру

    deleteImage: (id) =>
      safeCall(() => ops.deleteImage(db!, id)),                   // Удаление изображения

    getMarkerImages: (id) =>
      safeCall(() => ops.getMarkerImages(db!, id)),               // Получение изображений маркера

    isLoading,  // Флаг загрузки
    error,      // Последняя ошибка
  };

  return (
    <DatabaseContext.Provider value={value}>
      {children} {/* Все дочерние компоненты теперь имеют доступ к базе данных через useDatabase */}
    </DatabaseContext.Provider>
  );
};