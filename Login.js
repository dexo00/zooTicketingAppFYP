import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ImageBackground } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import CustomButton from './CustomButton';
import { BlurView } from 'expo-blur';


const Login = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [failedAttempts, setFailedAttempts] = useState(0);
  const [buttonDisabled, setButtonDisabled] = useState(false);
  const [lastFailedAttemptTime, setLastFailedAttemptTime] = useState(null);
  const [remainingTime, setRemainingTime] = useState(0);
  const timeoutDuration = 30 * 60 * 1000; // Timeout duration in milliseconds (10 minutes)
  const ipAddress = "http://152.42.168.126:81";


  useEffect(() => {
    loadState();
  }, []);

  useEffect(() => {
    // Save state data whenever it changes
    saveState();
  }, [failedAttempts, buttonDisabled, lastFailedAttemptTime]);

    //Reset failed attempts counter every hour
  useEffect(() => {
    const interval = setInterval(() => {
      setFailedAttempts(0);
      setLastFailedAttemptTime(null);
      setButtonDisabled(false);
      setRemainingTime(0);
      clearInterval(interval);
    },60 * 60 * 1000); // Reset every hour
    console.log("failed attempts reset: ", failedAttempts)
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    // Calculate remaining time
    const calculateRemainingTime = () => {
      if (lastFailedAttemptTime !== null) {
        const currentTime = new Date().getTime();
        const timeSinceLastFailedAttempt = currentTime - lastFailedAttemptTime;
        return Math.max(0, timeoutDuration - timeSinceLastFailedAttempt);
      }
      return 0;
    };

    if (failedAttempts >= 5) {
      setButtonDisabled(true);
      const remainingTime = calculateRemainingTime();
      setRemainingTime(remainingTime);
      const timer = setInterval(() => {
        setRemainingTime(prevTime => Math.max(0, prevTime - 1000));
      }, 1000);
      const timeout = setTimeout(() => {
        setButtonDisabled(false);
        setFailedAttempts(0);
        setLastFailedAttemptTime(null);
        setRemainingTime(0);
        clearInterval(timer);
      }, remainingTime);
      return () => {
        clearInterval(timer);
        clearTimeout(timeout);
      };
    }
  }, [failedAttempts, lastFailedAttemptTime]);

  const handleLogin = async () => {
  if (!email || !password) {
    alert('Both email and password fields must not be empty.');
    return;
  }

  const requestBody = {
    email: email,
    password: password,
  };

  try {
    const response = await axios.post(`${ipAddress}/login`, requestBody);

    console.log('email:-' + email, 'password:' + password);
    console.log('Server response:', response.data);

    if (response.status === 200) {
      AsyncStorage.setItem('userEmail', email);
      console.log('Email saved successfully:', email);
      
      const loginTimestamp = new Date().getTime();
      await AsyncStorage.setItem('loginTimestamp', loginTimestamp.toString());
      setFailedAttempts(0);
      console.log('Login successful');
      navigation.navigate('MainMenu');
    } else {
      console.log('Login failed:', response.data.message);
      alert('Invalid credentials. Please check your email and password.');
      setFailedAttempts(prevAttempts => prevAttempts + 1);
      console.log('failed attempts: ' + failedAttempts)
      setLastFailedAttemptTime(new Date().getTime());
    }
  } catch (error) {
    console.error('Error:', error);
    alert('No such account found with credentials.');
    setFailedAttempts(prevAttempts => prevAttempts + 1);
    console.log('failed attempts: ' + failedAttempts)
    
    setLastFailedAttemptTime(new Date().getTime());
  }
};

  const renderFailedAttemptsMessage = () => {
    if (failedAttempts >= 5) {
      const minutes = Math.ceil(remainingTime / (1000 * 60) - 1);
      const seconds = Math.ceil((remainingTime % (1000 * 60)) / 1000);
      return (
        <View style={styles.failedAttemptsContainer}>
          <Text style={[styles.failedAttemptsMessage, { marginBottom: 0 }]}>Maximum login attempts reached. </Text>
          <Text style={styles.failedAttemptsMessage}>Please try again in: {minutes.toString().padStart(2, '0')}:{seconds.toString().padStart(2, '0')}</Text>
        </View>
      );
    }
    return null;
  };

  const loadState = async () => {
    try {
      const savedFailedAttempts = await AsyncStorage.getItem('failedAttempts');
      const savedButtonDisabled = await AsyncStorage.getItem('buttonDisabled');
      const savedLastFailedAttemptTime = await AsyncStorage.getItem('lastFailedAttemptTime');
      if (savedFailedAttempts !== null) setFailedAttempts(JSON.parse(savedFailedAttempts));
      if (savedButtonDisabled !== null) setButtonDisabled(JSON.parse(savedButtonDisabled));
      if (savedLastFailedAttemptTime !== null) setLastFailedAttemptTime(JSON.parse(savedLastFailedAttemptTime));
    } catch (error) {
      console.error('Error loading state:', error);
    }
  };

  const saveState = async () => {
    try {
      await AsyncStorage.setItem('failedAttempts', JSON.stringify(failedAttempts));
      await AsyncStorage.setItem('buttonDisabled', JSON.stringify(buttonDisabled));
      await AsyncStorage.setItem('lastFailedAttemptTime', JSON.stringify(lastFailedAttemptTime));
    } catch (error) {
      console.error('Error saving state:', error);
    }
  };

  return (
    <View style={styles.imgContainer}>
      <ImageBackground
        source={require('./assets/background.jpg')}
        style={styles.imageBackground}
      >
        <View style={styles.container}>
        <BlurView intensity={20} style={styles.blurContainer}>

          <View style={styles.menuContainer}>
            <Text style={styles.heading}>Log In</Text>
            <TextInput
              style={styles.input}
              placeholder='Email'
              placeholderTextColor='#9594aa'
              onChangeText={(text) => setEmail(text)}
              value={email}
              autoCapitalize='none'
            />
            <TextInput
              style={styles.input}
              placeholder='Password'
              placeholderTextColor='#9594aa'
              onChangeText={(text) => setPassword(text)}
              value={password}
              secureTextEntry
              autoCapitalize='none'
            />
            <TouchableOpacity onPress={() => navigation.navigate('ForgotPassword')}>
              <Text style={styles.forgotPassword}>Forgot password?</Text>
            </TouchableOpacity>
            {renderFailedAttemptsMessage()}
            <CustomButton
              style={styles.button}
              title="Sign In"
              onPress={handleLogin}
              disabled={buttonDisabled}
            />
          </View>
          </BlurView>
        </View>
      </ImageBackground>
    </View>
  );
};

const styles = StyleSheet.create({
  imgContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  imageBackground: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  container: {
    flex: 1,
    padding: 20,
    paddingHorizontal: 30,
    justifyContent: 'flex-start',
  },
  menuContainer: {
    width: '100%',
    marginTop: 0,
    borderRadius: 10,
    height: 'auto',
    padding: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.4)',
  },
  heading: {
    color: '#3C332A',
    fontSize: 40,
    fontWeight: 'bold',
    alignSelf: 'flex-start',
    padding: 15,
    fontFamily: 'Rubik-Bold',
  },
  input: {
    width: '100%',
    height: 50,
    backgroundColor: '#F3F2EF',
    borderColor: '#d9ba73',
    fontFamily: 'Rubik',
    color: '#3C332A',
    borderWidth: 1,
    marginBottom: 15,
    padding: 10,
    borderRadius: 10,
    fontSize: 16,
  },
  forgotPassword: {
    color: '#3a606b',
    textDecorationLine: 'underline',
    marginBottom: 10,
  },
  button: {
    marginTop: 10,
  },
  failedAttemptsContainer: {
    marginTop: 10,
    alignItems: 'center',
  },
  failedAttemptsMessage: {
    color: 'red',
    marginBottom: 10,
  },
  blurContainer: {
    marginTop:100,
    overflow: 'hidden',
    borderRadius: 10,
  },
});

export default Login;
