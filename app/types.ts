// Интерфейс маркера на карте
export interface Marker {
  id: number;  // Уникальный идентификатор маркера (primary key в базе данных)

  latitude: number; // Широта маркера 

  longitude: number; // Долгота маркера 

  created_at: string; // Дата и время создания маркера 
}


// Интерфейс изображения, привязанного к маркеру
export interface MarkerImage {
  id: number; // Уникальный идентификатор изображения (primary key в таблице изображений)

  marker_id: number; // ID маркера, к которому относится изображение (внешний ключ)

  uri: string; // Путь к изображению в файловой системе устройства

  created_at: string; // Дата и время добавления изображения
}