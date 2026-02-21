import { useLocalSearchParams, useRouter } from "expo-router"; 
// Хуки для работы с параметрами маршрута (id маркера) и навигации

import { useEffect, useState } from "react"; 
// Хуки состояния и побочных эффектов React

import { View, Text, Button, Alert, FlatList, Image } from "react-native"; 
// Компоненты React Native: контейнеры, текст, кнопки, всплывающие окна, списки и изображения

import * as ImagePicker from "expo-image-picker"; 
// Модуль для выбора изображений из галереи

import { useDatabase } from "../contexts/DatabaseContext"; 
// Хук для доступа к контексту базы данных

import { Marker, MarkerImage } from "../types"; 
// Типы TypeScript для маркера и изображений

// Компонент экрана деталей маркера
export default function MarkerDetails() {
  const { id } = useLocalSearchParams<{ id: string }>(); 
  // Получаем id маркера из параметров маршрута
  const markerId = Number(id); // Преобразуем id в число
  const router = useRouter();  // Хук для навигации (назад, вперёд, push)

  // Извлекаем методы базы данных
  const {
    getMarkerImages,
    addImage,
    deleteImage,
    deleteMarker,
    getMarkers,
    isLoading,
  } = useDatabase();

  const [marker, setMarker] = useState<Marker | null>(null); 
  // Состояние конкретного маркера
  const [images, setImages] = useState<MarkerImage[]>([]); 
  // Состояние списка изображений маркера

  // Загрузка информации о маркере
  const loadMarker = async () => {
    try {
      const allMarkers = await getMarkers(); // Получаем все маркеры из БД
      const m = allMarkers.find((item) => item.id === markerId) || null; 
      // Находим маркер по id
      setMarker(m); // Сохраняем в state
    } catch (err) {
      console.error("Ошибка загрузки маркера:", err); 
      // Логируем ошибки
    }
  };

  // Загрузка изображений маркера
  const loadImages = async () => {
    try {
      const data = await getMarkerImages(markerId); 
      // Получаем все изображения по id маркера
      setImages(data); // Сохраняем в state
    } catch (err) {
      console.error("Ошибка загрузки изображений:", err);
    }
  };

  // Эффект при загрузке базы данных
  useEffect(() => {
    if (!isLoading) {
      loadMarker(); // Загружаем маркер
      loadImages(); // Загружаем изображения
    }
  }, [isLoading]);

  // Функция выбора изображения из галереи
  const pickImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images, 
        // Только изображения
      });

      if (!result.canceled) {
        await addImage(markerId, result.assets[0].uri); 
        // Добавляем изображение в БД
        await loadImages(); // Обновляем список
      }
    } catch (err) {
      console.error("Ошибка добавления изображения:", err);
    }
  };

  // Удаление маркера с подтверждением
  const handleDeleteMarker = () => {
    Alert.alert("Удаление", "Удалить маркер?", [
      { text: "Отмена", style: "cancel" }, 
      // Кнопка отмены
      {
        text: "Удалить",
        style: "destructive",
        onPress: async () => {
          try {
            await deleteMarker(markerId); // Удаляем маркер из БД
            router.back(); // Возвращаемся на экран карты
          } catch (err) {
            console.error("Ошибка удаления маркера:", err);
          }
        },
      },
    ]);
  };

  // Если база ещё загружается или маркер не найден
  if (isLoading || !marker) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <Text>Загрузка данных маркера...</Text>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, padding: 16 }}>
      {/* Отображение координат маркера */}
      <View style={{ marginBottom: 16 }}>
        <Text>Широта: {marker.latitude}</Text>
        <Text>Долгота: {marker.longitude}</Text>
      </View>

      {/* Кнопка добавления изображения */}
      <Button title="Добавить изображение" onPress={pickImage} />

      {/* Список изображений */}
      <FlatList
        data={images} 
        keyExtractor={(item) => item.id.toString()} 
        renderItem={({ item }) => (
          <View style={{ marginVertical: 10 }}>
            <Image
              source={{ uri: item.uri }} 
              style={{ width: "100%", height: 200 }} 
            />
            <Button
              title="Удалить изображение"
              onPress={async () => {
                try {
                  await deleteImage(item.id); // Удаляем изображение из БД
                  await loadImages();         // Обновляем список изображений
                } catch (err) {
                  console.error("Ошибка удаления изображения:", err);
                }
              }}
            />
          </View>
        )}
      />

      {/* Кнопка удаления самого маркера */}
      <Button
        title="Удалить маркер"
        color="red"
        onPress={handleDeleteMarker} 
      />
    </View>
  );
}