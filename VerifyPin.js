import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Image, StyleSheet, SafeAreaView } from 'react-native';
import CustomButton from './CustomButton';

const VerifyPin = ({ navigation, route }) => {
  const [pinInput, setPinInput] = useState('');
  const [expiryTime, setExpiryTime] = useState(null);
  const [remainingTime, setRemainingTime] = useState(0);

  const { pin, email } = route.params;

  useEffect(() => {
    // Set expiry time 5 minutes from now
    const currentTime = new Date().getTime();
    const expiry = currentTime + 5 * 60 * 1000; // 5 minutes in milliseconds
    setExpiryTime(expiry);

    // Update remaining time every second
    const interval = setInterval(() => {
      const remaining = Math.max(0, Math.floor((expiry - new Date().getTime()) / 1000));
      setRemainingTime(remaining);
    }, 1000);

    // Cleanup function to clear interval when component unmounts
    return () => clearInterval(interval);
  }, []);

  const handleVerifyPIN = () => {
    if (pinInput === pin.toString()) {
      alert('PIN verified successfully. Proceed with password reset.');
      // Navigate to the screen where the user can reset their password
      navigation.navigate('ResetPassword', { email: email });
    } else {
      alert('Incorrect PIN. Please try again.');
    }
  };

  // Format remaining time as minutes and seconds
  const minutes = Math.floor(remainingTime / 60);
  const seconds = remainingTime % 60;
  const formattedTime = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.innerContainer}>
        <Image
          source={require('./assets/email.png')}
          style={styles.pagerimg}
        />
        <Text style={styles.textLight}>A 4 digit pin has been sent to your email.</Text>
        <Text style={[styles.textLight, {marginBottom:0}]}>This PIN will expire in:</Text>
        <Text style={[styles.textLight, {color:"#c74e4e"}]}>{formattedTime}</Text>

        <TextInput
          style={styles.input}
          placeholder="Enter the 4-digit PIN"
          placeholderTextColor="#9594aa"
          onChangeText={(text) => setPinInput(text)}
          value={pinInput}
          keyboardType="numeric"
          maxLength={4}
        />
        <CustomButton title="Verify PIN" onPress={handleVerifyPIN} disabled={remainingTime === 0}/>
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
    width: '85%',
    marginTop: 20,
    alignItems: 'center',
  },
  textLight: {
    fontSize: 20,
    fontFamily: 'Rubik',
    color: 'grey',
    marginBottom: 10,
  },
  pagerimg: {
    resizeMode: 'contain',
    height: 150,
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
});

export default VerifyPin;
