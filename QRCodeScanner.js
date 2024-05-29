import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Button, TextInput, ImageBackground } from 'react-native';
import { BarCodeScanner } from 'expo-barcode-scanner';
import CustomButton from './CustomButton';
import axios from 'axios';
import { BlurView } from 'expo-blur';

const QrCodeScanner = () => {
  const [hasPermission, setHasPermission] = useState(null);
  const [scanned, setScanned] = useState(false);
  const [text, setText] = useState('Positon the QR Code inside of the box');
  const [isValid, setIsValid] = useState(null);
  const [inputBookingId, setInputBookingId] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const ipAddress = "http://152.42.168.126:81";


  const askForCameraPermission = () => {
    (async () => {
      const { status } = await BarCodeScanner.requestPermissionsAsync();
      setHasPermission(status === 'granted');
    })();
  };

  useEffect(() => {
    askForCameraPermission();
  }, []);

  const handleBarCodeScanned = async ({ type, data }) => {
    setScanned(true);
    setText('Please wait...');
    console.log(data);
  
    setIsLoading(true);
  
    try {
      const response = await axios.get(`${ipAddress}/scanQR1/${data}`);
  
      if (response.data.success) {
        const data = response.data.data; 
        const displayString = data.map((booking) => (
            <View style={styles.resultBox} key={booking.bookingId}>
                      <Text style={[styles.maintext, {textAlign:'center', fontSize: 25, marginTop:10, marginBottom: 5,}]}> Ticket Used!</Text>
                      <View style={styles.hr} />    
                                        
              <Text style={styles.bookingResult}>
              {booking.ticketTypeName}{'\n'}
                Visit Date:
                <Text style={styles.resultText}>{" " + new Date(booking.date).toLocaleDateString()}</Text>
              </Text>
    
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
        )
        );
        setIsLoading(false);
        setText(displayString);
        setIsValid(true);
      } else {
        setIsLoading(false);
        setText('Ticket Invalid');
        setIsValid(false);
      }
    } catch (error) {
      console.error("Error during barcode scan:", error);
      setIsLoading(false);
      setText('Ticket Invalid');
      setIsValid(false);
    }
  };

  if (hasPermission === null) {
    return (
      <View style={styles.container}>
        <Text>Requesting camera permission...</Text>
      </View>
    );
  }
  if (hasPermission === false) {
    return (
      <View style={styles.container}>
        <Text style={{ margin: 10 }}>No access to camera</Text>
        <Button title={'Allow Camera'} onPress={() => askForCameraPermission()} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ImageBackground
          style={styles.backgroundImage}
          source={require('./assets/backdark.jpg')}
          resizeMode="cover"
        >
                <BlurView intensity={50} style={styles.blurContainer}>

      <View style={styles.outline}>
        <View style={styles.barcodebox}>
          <BarCodeScanner
            onBarCodeScanned={scanned ? undefined : handleBarCodeScanned}
            style={{ height: 300, width: 320 }}
          />
        </View>
      </View>
      {scanned && (
        <>
          <CustomButton title={'Scan again'} onPress={() => setScanned(false)} color="tomato" />
        </>
      )}
      <Text style={[styles.beforeScanText, { backgroundColor: isValid ? 'rgba(96, 150, 96, 0.3)' : 'rgba(133, 52, 62, 0.5)' }]}>
        {text}
      </Text>
      </BlurView>

      </ImageBackground>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  backgroundImage: {
    flex:1,
    resizeMode:'cover',
    marginTop: 0, // Adjust this property to make sure the image starts from the top

  },
  blurContainer: {
    flex: 1,
    overflow: 'hidden',
    padding: 30,
    justifyContent: 'top',
    alignItems: 'center',
  },
  maintext: {
    fontSize: 16,
    color:'white',
    borderRadius: 10,
    overflow: 'hidden',
    fontFamily: 'Rubik-Bold',
    textAlign:'center', 
  },
  resultText: {
    fontSize: 20,
    marginBottom: 8,
    color:'white',
    paddingLeft:10,
    borderRadius: 5,
    overflow: 'hidden',
    fontFamily: 'Rubik',
  },
  beforeScanText: {
    fontSize: 20,
    marginTop:20,
    padding: 10,
    color:'white',
    backgroundColor: '#609660',
    borderRadius: 5,
    borderColor: 'rgba(255,255,255, 0.2)',
    borderWidth: 1,
    overflow: 'hidden',
    fontFamily: 'Rubik',
    alignContent: 'center',
    justifyContent: 'center',

    shadowColor: 'black',
    shadowOpacity: 0.55,
    shadowRadius: 20,
    overflow: 'visible',
  },
  barcodebox: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
    borderRadius: 30,
    marginBottom: 20,
    overflow: 'hidden',
    backgroundColor: 'tomato',
    borderWidth: 4,
    borderColor: 'black',
    fontFamily: 'Rubik-Bold',
  },
  input: {
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    marginBottom: 20,
    padding: 10,
    width: '100%',
  },
  title: {
    color: '#3C332A',
    fontSize: 30,
    fontWeight: 'bold',
    marginBottom: 10,
    fontFamily: 'Rubik-Bold',
  },
  bookingResult: {
    color: 'white',
    fontFamily: 'Rubik-Bold',
    minWidth: '100%',
    padding: 10,
    fontSize: 20,
    paddingBottom:5,
    marginBottom: 0,
  },
  resultBox: {
    alignSelf: 'center',
    width: 'auto',
    padding: 10,
    paddingTop:0 ,
  },
  hr: {
    borderWidth: 0.5,
    marginVertical: 3,
    borderColor: 'rgba(255,255,255, 0.5)',
    width: '100%',
  },
  
});

export default QrCodeScanner;
