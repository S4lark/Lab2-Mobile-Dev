 // Импортируем компонент Stack из Expo Router для организации навигации между экранами
import { Stack } from "expo-router";
// Импортируем наш контекст DatabaseProvider, который предоставляет доступ к базе данных SQLite всем дочерним компонентам
import { DatabaseProvider } from "../app/contexts/DatabaseContext"; 


// Основной компонент layout приложения
export default function Layout() {
  return (
    // Оборачиваем приложение в DatabaseProvider, чтобы все экраны могли использовать контекст базы данных
    <DatabaseProvider>  
      {/* Stack автоматически строит навигацию по файловой структуре папки app */}
      <Stack />          
    </DatabaseProvider>
  );
}