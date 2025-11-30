import AsyncStorage from '@react-native-async-storage/async-storage';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useContext, useEffect, useState } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { AuthContext, AuthProvider } from './src/screens/AuthContext';
import CarsScreen from './src/screens/CarsScreen';
import DiagnosticsScreen from './src/screens/DiagnosticsScreen';
import LoginScreen from './src/screens/LoginScreen';
import ProfileScreen from './src/screens/ProfileScreen';
import RegisterScreen from './src/screens/RegisterScreen';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

function AuthStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Register" component={RegisterScreen} />
    </Stack.Navigator>
  );
}

function AppStack() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: true,
        headerStyle: {
          backgroundColor: '#1976d2',
        },
        headerTintColor: '#fff',
        headerTitleStyle: {
          fontWeight: 'bold',
        },
        tabBarActiveTintColor: '#1976d2',
        tabBarInactiveTintColor: '#999',
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '500',
        },
      })}
    >
      <Tab.Screen
        name="CarsTab"
        component={CarsScreen}
        options={{
          title: 'My Cars',
          tabBarLabel: 'Cars',
          tabBarIcon: ({ color }) => <View style={{ width: 20, height: 20, backgroundColor: color, borderRadius: 2 }} />,
        }}
      />
      <Tab.Screen
        name="DiagnosticsTab"
        component={DiagnosticsScreen}
        options={{
          title: 'AI Diagnostics',
          tabBarLabel: 'Diagnostics',
          tabBarIcon: ({ color }) => <View style={{ width: 20, height: 20, backgroundColor: color, borderRadius: 2 }} />,
        }}
      />
      <Tab.Screen
        name="ProfileTab"
        component={ProfileScreen}
        options={{
          title: 'Profile',
          tabBarLabel: 'Profile',
          tabBarIcon: ({ color }) => <View style={{ width: 20, height: 20, backgroundColor: color, borderRadius: 2 }} />,
        }}
      />
    </Tab.Navigator>
  );
}

function RootNavigator() {
  const { isLoggedIn, setIsLoggedIn, setUser } = useContext(AuthContext);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const bootstrapAsync = async () => {
      try {
        const token = await AsyncStorage.getItem('authToken');
        const user = await AsyncStorage.getItem('user');
        if (token && user) {
          setUser(JSON.parse(user));
          setIsLoggedIn(true);
        }
      } catch (error) {
        console.error('Error restoring token:', error);
      } finally {
        setIsLoading(false);
      }
    };

    bootstrapAsync();
  }, []);

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#1976d2" />
      </View>
    );
  }

  return (
    <>
      {isLoggedIn ? <AppStack /> : <AuthStack />}
    </>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <RootNavigator />
    </AuthProvider>
  );
}
