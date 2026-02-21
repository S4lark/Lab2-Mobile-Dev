import { useEffect, useState } from "react";                 // Хуки React: useState для состояния, useEffect для побочных эффектов
import { View, StyleSheet, Text } from "react-native";       // Компоненты React Native для UI
import Map from "../components/Map";                        // Наш компонент карты, отображающий маркеры
import { useDatabase } from "../contexts/DatabaseContext";  // Хук для доступа к базе данных через контекст
import { Marker } from "../types";                           // Типы TypeScript для маркеров
import { useFocusEffect } from "expo-router";               // Хук, который срабатывает при фокусе экрана (возврат на экран)
import React from "react";                                   // Основной React импорт

export default function Index() {
  const { getMarkers, addMarker, isLoading } = useDatabase(); // Получаем функции работы с БД и флаг загрузки
  const [markers, setMarkers] = useState<Marker[]>([]);       // Локальный state для хранения маркеров на карте

  // Функция загрузки маркеров из базы данных
  const loadMarkers = async () => {
    try {
      const data = await getMarkers(); // Получаем все маркеры из SQLite
      setMarkers(data);                // Обновляем локальный state
    } catch (err) {
      console.error("Ошибка загрузки маркеров:", err); // Логирование ошибок
    }
  };

  // Первичная загрузка маркеров после инициализации базы
  useEffect(() => {
    if (!isLoading) loadMarkers(); // Ждём пока база загрузится
  }, [isLoading]);

  // Автообновление маркеров при возвращении на экран карты
  useFocusEffect(
    React.useCallback(() => {
      if (!isLoading) loadMarkers(); // Загружаем маркеры заново при фокусе экрана
    }, [isLoading])
  );

  // Обработчик долгого нажатия на карту для добавления нового маркера
  const handleLongPress = async (lat: number, lon: number) => {
    try {
      await addMarker(lat, lon); // Добавляем маркер в базу данных
      await loadMarkers();        // Обновляем локальный state, чтобы маркер сразу появился на карте
    } catch (err) {
      console.error("Ошибка добавления маркера:", err);
    }
  };

  // Пока база данных загружается, показываем экран ожидания
  if (isLoading) {
    return (
      <View style={styles.loading}>
        <Text>Загрузка базы данных...</Text>
      </View>
    );
  }

  // Основной рендер карты с маркерами
  return (
    <View style={styles.container}>
      <Map 
        markers={markers}            // Передаём список маркеров на карту
        onLongPress={handleLongPress} // Передаём обработчик долгого нажатия
      />
    </View>
  );
}

// Стили для экрана
const styles = StyleSheet.create({
  container: { flex: 1 },                                        // Контейнер занимает весь экран
  loading: { flex: 1, justifyContent: "center", alignItems: "center" }, // Центрируем текст при загрузке
});