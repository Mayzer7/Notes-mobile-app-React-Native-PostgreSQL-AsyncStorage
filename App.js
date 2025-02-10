import React, {useEffect} from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import Notion from './screens/Notion'; // экран с заметками
import AuthScreen from './screens/AuthScreen'; // экран аутентификации
import EmailScreen from './screens/EmailScreen';
import RegistrationScreen from './screens/RegistrationScreen';

const Stack = createStackNavigator();

export default function App() {
  // useEffect(() => {
  // }, []);

  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Auth">
        <Stack.Screen 
          name="Auth" 
          component={AuthScreen} 
          options={{ headerShown: false }} // Отключаем заголовок
        />
        <Stack.Screen name="Notion" component={Notion} options={{ headerShown: false }} />
        <Stack.Screen name="Email" component={EmailScreen} />
        <Stack.Screen name="Registration" component={RegistrationScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}



