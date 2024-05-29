import React, { useState } from 'react';
import { View, Text, TextInput, Image,ImageBackground, StyleSheet, ScrollView, SafeAreaView,StatusBar } from 'react-native';
import CustomButton from './CustomButton';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';

import { BlurView } from 'expo-blur';
import axios from 'axios';


const FindById = () => {
  const [email, setEmail] = useState('');
  const [result, setResult] = useState('');
  const [showResults, setShowResults] = useState(false);
  const [buttonDisabled, setButtonDisabled] = useState(false);

  const ipAddress = "http://152.42.168.126:81";

  const handleSetStatus = async (bookingID) => {
    console.log("searched id: " + bookingID);
    try {
      const response = await axios.get(`${ipAddress}/setStatus/${bookingID}`);
      
      if (response) {
        setResult('Ticket Used!');
      } else {
        setResult('Error using ticket!');
      }
    } catch (error) {
      console.error('Error using ticket! :', error);
      setResult('Error using ticket! Please try again.');
    }
  };

  const handleFindById = async () => {
    try {
      setButtonDisabled(true);
      if (!email.trim()) {
        setShowResults(true);
        setResult('Please enter a valid Email.');
        return;
      }
  
      const response = await axios.get(`${ipAddress}/findByVisitor/${email}`);
  
      if (response.data.success) {
        const data = response.data.data; 
        const displayString = data.map((booking) => (
          <View style={{marginBottom:7}}> 
          
            <View style={styles.resultBox} key={booking.bookingId}>
              <View style={{marginBottom:10}}>
              <Text style={styles.bookingResult}>
                {booking.ticketTypeName}{'\n'}
                Visit Date:
                <Text style={styles.resultText}>{" " + new Date(booking.date).toLocaleDateString()}</Text>
              </Text>
              <View style={styles.hr} />
    
              {/* Render details if available */}
              {booking.details && Array.isArray(booking.details) && booking.details.map((detail, detailIndex) => (
                <View key={detailIndex}>
                  {detail.quantity !== 0 && (
                    <Text style={styles.resultText}>
                      {detail.is_local ? 'Local' : 'Foreign'} {detail.demoCategoryName} X {detail.quantity}
                    </Text>
                  )}
                </View>
              ))}
            </View>
              <CustomButton
                title="Use Ticket"
                onPress={() => handleSetStatus(booking.bookingID)}
                buttonStyle={{ backgroundColor: '#40ad5d' }}
              />
          </View>
          </View>
        ));
  
        setShowResults(true);
        setResult(displayString);
      } else {
        setShowResults(true);
        setResult('Error: ' + response.data.message);
      }
    } catch (error) {
      console.error('Error finding booking:', error);
      setShowResults(true);
      setResult('Error finding booking. Please try again.');
    }
    setButtonDisabled(false);

  };
  
 

  return (
    <KeyboardAwareScrollView contentContainerStyle={{flex: 1}}>
    <ImageBackground
          style={styles.backgroundImage}
          source={require('./assets/backdark.jpg')}
          resizeMode="cover"
        >
          <BlurView intensity={50} style={styles.blurContainer}>

      <ScrollView style={styles.scroll}>
      <StatusBar barStyle="dark-content"/>
        <Text style={styles.text2}>Enter ticket owner's Email below to find ticket</Text>
        <Image source={require('./assets/searchbg.png')} style={styles.image} />
           <TextInput
          style={styles.input}
          placeholder="Enter Email"
          value={email}
          placeholderTextColor={'#9594aa'}
          autoCapitalize='none'
          onChangeText={text => setEmail(text)}
        />
        <CustomButton title="Find" onPress={handleFindById} disabled={buttonDisabled}/>
        {showResults && (
          <View style={styles.showResults}>
            <Text style={styles.result}> {result}</Text>
          </View>
          
        )}
       
      </ScrollView>
      </BlurView>

      </ImageBackground>
    </KeyboardAwareScrollView>
  );
};


const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  backgroundImage: {
    flex:1,
    height: 'max',
    resizeMode:'cover',
    marginTop: 0, 
  },
  blurContainer: {
    flex: 1,
    overflow: 'hidden',
    justifyContent: 'top',
    alignItems: 'center',
  },
  card: {
    backgroundColor: "#F3F2EF",
    borderWidth: 1,
    borderRadius: 10,
    borderColor: "#e6e5e3",
  },
  scroll: {
    padding: 30,
    flex:1,
  },
  text: {
    color: '#3C332A',
    fontSize: 30,
    fontFamily: 'Rubik-Bold',
    textAlign: 'center',
  },
  text2: {
    color: 'white',
    fontSize: 20,
    fontFamily: 'Rubik',
    textAlign: 'center',
  },
  input: {
    width: '100%',
    height: 50,
    backgroundColor: '#F3F2EF',
    borderColor: '#d9ba73',
    color: '#3C332A',
    borderWidth: 1,
    fontFamily: 'Rubik',
    marginBottom: 15,
    padding: 10, 
    borderRadius: 10,
    fontSize: 16,
  },
  result: {
    fontFamily: 'Rubik',
    fontSize: 22,
  },
  bookingResult: {
    color: '#3C332A',
    fontFamily: 'Rubik-Bold',
    minWidth: '100%',
    fontSize: 22,
    marginRight: 5,
  },
  resultText: {
    color: '#3C332A',
    fontFamily: 'Rubik',
    minWidth: '100%',
    fontSize: 20,
  },
  showResults: {
    backgroundColor:'rgba(255,255,255, .5)',
    borderColor: 'rgba(255,255,255, .5)',
    borderWidth: 1,
    borderRadius: 5,
    marginTop: 10, 
    marginBottom:100,
    paddingVertical: 2,
    paddingHorizontal: 10,
    alignItems: 'center',

  },
  image: {
    width: 350, 
    height: 350,
    marginBottom: 0, 
  },
  resultBox: {
    backgroundColor:'rgba(255,255,255, .9)',
    borderRadius: 5,
    borderColor: 'rgba(255,255,255, .5)',
    borderWidth: 1,
    padding: 15,
    paddingVertical: 8,
  },

  hr: {
    borderWidth: 0.5,
    marginVertical: 3,
    borderColor: 'rgba(0, 0, 0, 0.3)',
    width: '100%',
  },
  
});

export default FindById;
