import MapView, { Marker as MapMarker, MapPressEvent } from "react-native-maps"; 
// Импортируем MapView (сама карта), Marker (переименованный как MapMarker, чтобы не путать с нашим типом Marker) 
// и MapPressEvent (тип события нажатия на карту)

import { Marker } from "../types"; 
// Тип TypeScript для маркеров (id, latitude, longitude, created_at)

import { useRouter } from "expo-router"; 
// Хук для навигации между экранами с помощью Expo Router

interface Props {
  markers: Marker[];                     // Массив маркеров для отображения на карте
  onLongPress: (lat: number, lon: number) => void; 
  // Функция, которая вызывается при долгом нажатии на карту для добавления нового маркера
}

export default function Map({ markers, onLongPress }: Props) {
  const router = useRouter();            // Создаём роутер для перехода на экран деталей маркера

  // Обработчик долгого нажатия на карту
  const handleLongPress = (event: MapPressEvent) => {
    const { latitude, longitude } = event.nativeEvent.coordinate; // Получаем координаты точки нажатия
    onLongPress(latitude, longitude);                            // Вызываем переданную функцию добавления маркера
  };

  return (
    <MapView
      style={{ flex: 1 }}                // Карта занимает весь экран
      onLongPress={handleLongPress}      // Назначаем обработчик долгого нажатия
      initialRegion={{                   // Начальная область карты при загрузке
        latitude: 52.37,                 // Широта центра карты (например, Амстердам)
        longitude: 4.89,                 // Долгота центра карты
        latitudeDelta: 0.05,             // Масштаб по широте
        longitudeDelta: 0.05,            // Масштаб по долготе
      }}
    >
      {/* Рендерим все маркеры на карте */}
      {markers.map(marker => (
        <MapMarker
          key={marker.id}                 // Уникальный ключ для каждого маркера
          coordinate={{                    // Координаты маркера
            latitude: marker.latitude,
            longitude: marker.longitude,
          }}
          onPress={() =>                   // Обработчик нажатия на маркер
            router.push({                  // Переход на экран деталей маркера
              pathname: "/marker/[id]",   // Шаблон маршрута
              params: { id: marker.id },  // Передаём id маркера в параметры
            })
          }
        />
      ))}
    </MapView>
  );
}