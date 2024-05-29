import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';

const CustomButton = ({ title, onPress, buttonStyle, disabled }) => {
  return (
    <TouchableOpacity
      style={[styles.button, buttonStyle, disabled && styles.disabledButton]}
      onPress={onPress}
      disabled={disabled}
    >
      <Text style={[styles.buttonText, disabled && styles.disabledButtonText]}>{title}</Text>
    </TouchableOpacity>
  );
};
const styles = StyleSheet.create({
  button: {
    alignItems:'center',
    justifyContent: 'center',
    backgroundColor: '#a1685e', 
    padding: 10,
    borderRadius: 4,
    width: '100%',
    minHeight:50,

  },
  buttonText: {
    color: 'white',
    fontSize: 18,
    fontFamily: 'Rubik-Bold',
  },
  disabledButton: {
    backgroundColor: '#CCCCCC',
  },
  disabledButtonText: {
    color: '#999999',
  },
});

export default CustomButton;
