import React, { useState, useEffect } from 'react';
import { View, ScrollView, Text,ImageBackground, TextInput, Image, StyleSheet, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import CustomButton from './CustomButton';
import * as ImagePicker from 'expo-image-picker';
import { BlurView } from 'expo-blur';
import axios from 'axios';

const ReportForm = ({navigation}) => {
  const ipAddress = "http://152.42.168.126:81";


  const [image, setImage] = useState(null);
  const [subject, setSubject] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');

  useEffect(() => {
    loadEmail();
  }, []);

  const loadEmail = async () => {
    try {
      const savedEmail = await AsyncStorage.getItem('userEmail');
      if (savedEmail !== null) {
        setEmail(savedEmail);
      }
    } catch (error) {
      console.error('Error loading email:', error);
    }
  };

  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      base64: true, 
      quality: 0.5,
    });
  
    if (!result.canceled) {
      const imageSizeInBytes = result.assets[0].base64.length * 0.75; // Base64 encoding adds ~37% overhead
      const maxSizeInBytes = 8 * 1024 * 1024; // Maximum allowed size (8MB)
      console.log("imagesize: "+ imageSizeInBytes + " limit: "+maxSizeInBytes)
  
      if (imageSizeInBytes > maxSizeInBytes) {
        Alert.alert('Error', 'Selected image exceeds the maximum allowed size (8MB).');
        return;
      }
  
      setImage(result.assets[0].base64);
    }
  };
  

  const handleSubmit = () => {
    if (!description || !subject) {
      Alert.alert('Error', 'Please fill out subject and description fields.');
      return;
    }

    setLoading(true);

    const requestData = { subject, description };
    if (email) requestData.email = email; 
    if (image) requestData.image = image; 

    axios.post(`${ipAddress}/submit-report`, requestData)
      .then((response) => {
        Alert.alert('Success', 'Report submitted successfully');
        navigation.navigate('MainMenu');
      })
      .catch((error) => {
        Alert.alert('Error', 'Failed to submit report');
        console.error('Error:', error);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  return (
    <View style={styles.container}>
    <KeyboardAwareScrollView contentContainerStyle={{flex: 1}} >
      <ImageBackground
          style={styles.backgroundImage}
          source={require('./assets/backdark.jpg')}
          resizeMode="cover"
        >
      <BlurView intensity={50} style={styles.blurContainer}>

      <Text style={styles.textLight}>Fill out forms below to report an issue with the Zoo.</Text>

      <View style={styles.imgField}>
        {image && <Image source={{ uri: `data:image/jpeg;base64,${image}` }} style={styles.img} />}
        <CustomButton title="Choose Image (Optional)" onPress={pickImage} />
      </View>

      <TextInput
        style={styles.input}
        placeholder="Subject*"
        value={subject}
        onChangeText={setSubject}
      />
      <TextInput
        style={[styles.input, styles.descriptionInput]}
        placeholder="Description*"
        value={description}
        onChangeText={setDescription}
        multiline
      />

      <CustomButton title="Submit" onPress={handleSubmit} disabled={loading} />

      </BlurView>
      </ImageBackground>
      </KeyboardAwareScrollView>
      </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  backgroundImage: {
    flex: 1,
    resizeMode: 'cover',
  },
  blurContainer: {
    flex: 1,
    overflow: 'hidden',
    justifyContent: 'flex-start',
    alignItems: 'center',
    padding: 20,
  },
  imgField: {
    marginBottom: 20,
    alignItems: 'center',
  },
  img: {
    width: 350,
    height: 200,
    marginBottom: 10,
    padding: 10,
    borderWidth: 2,
    borderRadius: 10,
    borderColor: 'grey',
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
  descriptionInput: {
    height: 100,
  },
  textLight: {
    fontFamily:'Rubik',
    fontSize: 16,
    marginBottom: 20,
    color: 'white',
  },
});

export default ReportForm;
