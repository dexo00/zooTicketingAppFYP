import React, { useEffect } from 'react';
import { View, Image, TouchableOpacity, StyleSheet, StatusBar } from 'react-native';
import { NavigationContainer, useFocusEffect } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import MainMenu from './MainMenu';
import FindById from './FindById';
import QRCodeScanner from './QRCodeScanner';
import Login from './Login';
import ForgotPassword from './ForgotPassword';
import VerifyPin from './VerifyPin';
import ResetPassword from './ResetPassword';
import ReportForm from './ReportForm';
import { useFonts } from 'expo-font';

const Stack = createStackNavigator();

function App() {
  let [fontsLoaded] = useFonts({
    'Rubik': require('./assets/fonts/Rubik.ttf'),
    'Rubik-Bold': require('./assets/fonts/Rubik-Bold.ttf'),
  });

  if (!fontsLoaded) {
    return null;
  }

  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="MainMenu"
        screenOptions={{
          headerTitleContainerStyle: {
            padding: 10,
          },
          headerStyle: {
            backgroundColor: "#586b5c",
            
            shadowColor: '#171717',
            shadowOffset: { width: -2, height: 4 },
            shadowOpacity: 0.15,
            shadowRadius: 10,
          },
          headerTitleStyle: {
            color: 'white',
            fontSize: 23,
            fontFamily: "Rubik-Bold",
          },
          headerBackTitleVisible: false,
          headerTintColor: 'white',
        }}
      >
        <Stack.Screen
          name="Login"
          component={Login}
          options={{
            title: "Login",
            headerShown: false,
            gestureEnabled: false
          }}
        />
        <Stack.Screen
          name="MainMenu"
          component={MainMenu}
          options={{
            title: "Main Menu",
            gestureEnabled: false,
            headerLeft: null,
            headerShown: false,
            //headerBackground: () => <GradientHeader />,
            headerRight: ({ navigation }) => (
              <TouchableOpacity onPress={() => navigation.navigate('Login')}>
                <Image
                  source={require('./assets/logout.png')}
                  style={styles.icon}
                />
              </TouchableOpacity>
            ),
          }}
        />
        <Stack.Screen
          name="FindById"
          component={FindById}
          options={{
            title: "Find by Email",
          }}
        />
        <Stack.Screen
          name="QRCodeScanner"
          component={QRCodeScanner}
          options={{
            title: "Scan Ticket QR",
          }}
        />
        <Stack.Screen
          name="ForgotPassword"
          component={ForgotPassword}
          options={{
            title: "Forgot Password",
          }}
        />
        <Stack.Screen
          name="VerifyPin"
          component={VerifyPin}
          options={{
            title: "Verify Pin",
          }}
        />
        <Stack.Screen
          name="ResetPassword"
          component={ResetPassword}
          options={{
            title: "Reset Password",
          }}
        />
        <Stack.Screen
          name="ReportForm"
          component={ReportForm}
          options={{
            title: "Report an Issue",
          }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  icon: {
    width: 30,
    height: 30,
    margin: 10,
  },
});

export default App;
