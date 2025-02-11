import React, {useEffect} from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import Notion from './screens/Notion'; // экран с заметками
import AuthScreen from './screens/AuthScreen'; // экран аутентификации
import EmailScreen from './screens/EmailScreen';
import RegistrationScreen from './screens/RegistrationScreen';
import ProfileScreen from './screens/ProfileScreen';
import EditNameScreen from './screens/EditNameScreen';
import EditEmailScreen from './screens/EditEmailScreen';
import EditPasswordScreen from './screens/EditPasswordScreen';

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
        <Stack.Screen name="Profile" component={ProfileScreen} options={{ headerShown: false }}/>
        <Stack.Screen name="EditName" component={EditNameScreen} options={{ headerShown: false }}/>
        <Stack.Screen name="EditEmail" component={EditEmailScreen} options={{ headerShown: false }}/>
        <Stack.Screen name="EditPassword" component={EditPasswordScreen} options={{ headerShown: false }}/>
      </Stack.Navigator>
    </NavigationContainer>
  );
}



