import React, { useState } from 'react';
import { View, Text, TextInput, Image, StyleSheet, SafeAreaView, StatusBar, TouchableOpacity } from 'react-native';
import axios from 'axios';
import CustomButton from './CustomButton';

const ForgotPassword = ({ navigation }) => {
  const ipAddress = "http://152.42.168.126:81";

  StatusBar.setBarStyle('light-content');

  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const handleResetPassword = async () => {
    if (!email) {
      alert('Please enter your email.');
      return;
    }
    
    setLoading(true); // Set loading state to true when sending email
  
    // Generate a random 4-digit PIN
    const pin = Math.floor(1000 + Math.random() * 9000);
    console.log(pin);
    try {
      // Send the PIN via email
      const response = await axios.post(`${ipAddress}/send-email`, {
        email: email,
        pin: pin,
      });
  
      // Check if the email was sent successfully
      if (response.status === 200) {
        alert('A 4-digit PIN has been sent to your email.');
        // Navigate to the next screen for PIN verification
        // You can pass the generated PIN as a parameter to the next screen if needed
        navigation.navigate('VerifyPin', { pin: pin, email: email });
      } else {
        alert('Failed to send PIN. Please try again later.');
      }
    } catch (error) {
      console.error('Error sending PIN:', error);
      
      // Check for specific error conditions
      if (error.response && error.response.status === 404) {
        alert('This employee account does not exist.');
      } else {
        alert('An error occurred. Please try again later.');
      } 
    } finally {
        setLoading(false); 
      }
    };
  

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.innerContainer}>
      <Image
                source={require('./assets/lock.png')}
                style={[styles.pagerimg]}
              />
        <Text style={styles.textLight}>Enter your email below to recover your password. A 4-digit pin will be sent to your email.</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter your email"
          placeholderTextColor="#9594aa"
          onChangeText={(text) => setEmail(text)}
          value={email}
          autoCapitalize="none"
        />
        <CustomButton title="Reset Password" onPress={handleResetPassword} disabled={loading} />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    justifyContent: 'flex-start',
    alignItems: 'center',
  },
  innerContainer: {
    width: '80%',
    marginTop: 20,
    alignItems: 'center',
  },
  textLight: {
    fontSize: 20,
    fontFamily: 'Rubik',
    color: 'grey',
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
  backLink: {
    marginTop: 20,
    color: '#007bff', 
    textDecorationLine: 'underline',
  },
  pagerimg: {
    resizeMode: 'contain',
    height: 150,
    shadowColor: '#171717',
    shadowOffset: {width: -2, height:10},
    shadowOpacity: 0.25,
    shadowRadius: 5,
    marginBottom: 20,
    overflow: 'visible',

  },
});

export default ForgotPassword;
