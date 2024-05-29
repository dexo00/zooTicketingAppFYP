import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, SafeAreaView, StyleSheet, StatusBar } from 'react-native';
import axios from 'axios';
import CustomButton from './CustomButton';

const ResetPassword = ({ navigation, route }) => {
  useEffect(() => {
    StatusBar.setBarStyle('light-content');
  }, []);

  const { email } = route.params;
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleResetPassword = async () => {
    const ipAddress = "http://152.42.168.126:81";
    console.log('email: ' + email + ' new pass:' + password);

   
    
    if (!password || !confirmPassword) {
      setErrorMessage('Please enter both password fields.');
      return;
    }

    if (password !== confirmPassword) {
      setErrorMessage('Passwords do not match.');
      return;
    }

    if (password.length < 6) {
      setErrorMessage('Password should be at least 6 characters long.');
      return;
    }

    if (!/(?=.*[!@#$%^&*])/.test(password)) {
      setErrorMessage('Password must contain at least one special character.');
      return;
    }

    setLoading(true);
    setErrorMessage('');

    const requestBody = {
      email: email,
      password: password,
    };
    
    try {
      const response = await axios.post(`${ipAddress}/reset-password`, requestBody);
      console.log(requestBody);
      if (response.data.status === "Password changed!") {
        alert('Password reset successful.');
        navigation.navigate('Login'); // Navigate to the login screen
      } else {
        setErrorMessage(response.data.message || 'Password reset failed. Please try again.');
      }
    } catch (error) {
      console.error('Password reset failed:', error);
      setErrorMessage('Password reset failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.innerContainer}>
        <Text style={styles.heading}>Enter your new password</Text>
        <TextInput
          style={styles.input}
          placeholder="New Password"
          placeholderTextColor="#9594aa"
          onChangeText={text => setPassword(text)}
          value={password}
          secureTextEntry={true}
        />
        <TextInput
          style={styles.input}
          placeholder="Confirm Password"
          placeholderTextColor="#9594aa"
          onChangeText={text => setConfirmPassword(text)}
          value={confirmPassword}
          secureTextEntry={true}
        />
        {errorMessage ? <Text style={styles.error}>{errorMessage}</Text> : null}
        <CustomButton title="Reset Password" onPress={handleResetPassword} disabled={loading}/>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
  },
  innerContainer: {
    width: '80%',
    marginTop: 20,
    alignItems: 'center',
  },
  heading: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
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
  error: {
    color: 'red',
    fontFamily: 'Rubik',
    marginBottom: 15,
  },
});

export default ResetPassword;
