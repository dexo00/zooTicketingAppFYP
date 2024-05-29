import React, { useState, useEffect } from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity, ImageBackground, StatusBar, Alert } from 'react-native';
import { useIsFocused } from '@react-navigation/native'; // Import useIsFocused
import AsyncStorage from '@react-native-async-storage/async-storage';
import PagerView from 'react-native-pager-view';
import SimplePaginator from './SimplePaginator'; // Adjust the path accordingly
import { BlurView } from 'expo-blur';

const MainMenu = ({ navigation }) => {
  const [currentPage, setCurrentPage] = useState(0);
  const [email, setEmail] = useState('');
  
  const sessionTimeout = 30 * 24 * 60 * 60 * 1000;
  const countIntveral = 60 * 1000;

  //for testing
  //const sessionTimeout = 8 * 1000;
  //const countIntveral = 5 * 1000;

  const [remainingTime, setRemainingTime] = useState(sessionTimeout); // 30 days in milliseconds

  // Use useIsFocused to check if the MainMenu screen is focused
  const isFocused = useIsFocused();

  const loadEmail = async () => {
    try {
      const savedEmail = await AsyncStorage.getItem('userEmail');
      if (savedEmail !== null) {
        setEmail(savedEmail);
        console.log("email set: " + savedEmail )
      } else {
        handleLogout();
      }
    } catch (error) {
      console.error('Error loading email:', error);
    }
  };

  const loadLoginTimestamp = async () => {
    try {
      if (isFocused) {
        const loginTimestamp = await AsyncStorage.getItem('loginTimestamp');
        if (loginTimestamp !== null) {
          console.log("login timestamp retrieved");
          const currentTime = Date.now();
          const elapsedTime = currentTime - parseInt(loginTimestamp, 10);
          const remaining = Math.max(0, sessionTimeout - elapsedTime); // 30 days in milliseconds
          setRemainingTime(remaining);
  
          // Check for session timeout after loading login timestamp
          if (remaining <= 0) {
            Alert.alert('Logged out due to session timeout. Log in again.');
            handleLogout();
          }
        } else {
          console.log("login timestamp not retrieved");
  
          // If login timestamp is not available, set remaining time to default
          setRemainingTime(sessionTimeout); // 30 days in milliseconds
        }
      }
    } catch (error) {
      console.error('Error loading login timestamp:', error);
    }
  };
  useEffect(() => {
    loadEmail();
  }, [isFocused]);


  useEffect(() => {
    const interval = setInterval(() => {
      loadLoginTimestamp();
    }, countIntveral); // Check every minute

    return () => clearInterval(interval);
  }, [isFocused]);

  useEffect(() => {
    loadLoginTimestamp(); // Call the function when the component mounts
    const countdownInterval = setInterval(() => {
      setRemainingTime(prevTime => Math.max(0, prevTime - countIntveral)); // Countdown every minute
    }, countIntveral);
  
    return () => clearInterval(countdownInterval);
  }, []);


  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
  };

  const handleLogout = async () => {
    try {
      await AsyncStorage.removeItem('userEmail');
      await AsyncStorage.removeItem('loginTimestamp');
      navigation.navigate('Login');
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };


  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />

      <View style={styles.top}>
        <ImageBackground
          style={styles.backgroundImage}
          source={require('./assets/backdark.jpg')}
          resizeMode="cover"
        >
          <Text style={[styles.intro, {fontSize:25,paddingBottom:0, marginTop: '20%', color: "#bfd1be"}]}>Welcome,</Text>
          <Text style={[styles.intro, {marginTop: 0, paddingTop: 0, color: 'white', fontFamily:"Rubik-Bold"}]}> {email}</Text>

          <BlurView intensity={20} style={styles.blurContainer}>
      
          
          <View style={styles.body}>
          <SimplePaginator totalPages={3} currentPage={currentPage} onPageChange={handlePageChange} />

          <PagerView
            style={styles.pager}
            initialPage={currentPage}
            onPageSelected={(event) => handlePageChange(event.nativeEvent.position)}
          >
          <View key="1">
            <Image 
            source={require('./assets/searchmain.png')}
            style={[styles.pagerimg]}
            />
            <Text style={styles.textLight}>
                  Scan visitor's ticket QRs
            </Text>
            <TouchableOpacity style={styles.menuItem} onPress={() => navigation.navigate('QRCodeScanner')}>
              
            <Image
                source={require('./assets/scan.png')}
                style={styles.icon}
              />
              <Text style={styles.title}>
                  Scan Ticket QR
              </Text>

            </TouchableOpacity>
          </View>

          <View key="2">
          <Image
                source={require('./assets/searchidmain.png')}
                style={[styles.pagerimg]}
              />
              <Text style={styles.textLight}>
                  Search visitor tickets by searching their email
            </Text>
          <TouchableOpacity 
              style={[styles.menuItem, {backgroundColor: '#5d8fde'}]}
              title="Find Booking by ID"
              onPress={() => navigation.navigate('FindById')}
            >
              <Image
                source={require('./assets/search.png')}
                style={styles.icon}
              />
              <Text style={styles.title}>
                Find by Email
              </Text>
            </TouchableOpacity>
          </View>

          <View key="3">
          <Image
                source={require('./assets/reportmenu.png')}
                style={[styles.pagerimg]}
              />
              <Text style={styles.textLight}>
                  Report an issue with zoo facilities
            </Text>
          <TouchableOpacity 
              style={[styles.menuItem, {backgroundColor: '#de5d5d'}]}
              title="Report Issue"
              onPress={() => navigation.navigate('ReportForm')}
            >
              <Image
                source={require('./assets/report.png')}
                style={styles.icon}
              />
              <Text style={styles.title}>
                Report an issue
              </Text>
            </TouchableOpacity>
          </View>
         

          </PagerView>
        </View>
        </BlurView>
        </ImageBackground >
        </View>
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Image source={require('./assets/logout.png')} style={styles.logoutIcon}></Image>
          </TouchableOpacity>
    </View> 

  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'flex-start',
    flexDirection:'column',
  },
  top:{
    flex: 1,
    backgroundColor: 'transparent',
    marginTop: 0,
  },
  body:{
    backgroundColor: 'rgba(255,255,255,0.3)',
    paddingTop: 20,
    alignItems: 'center',
    borderRadius: 30,
    flex: 1,
    borderTopColor: 'white', 
    justifyContent: 'flex-start', 

  },
  backgroundImage: {
    flex:1,
    resizeMode:'cover',
    top:0,
    marginTop: 0, 
  },
  title: {
    color: 'white',
    fontFamily: "Rubik-Bold",
    fontSize: 30,
  },
  heading: {
    marginTop: 150,
    color: 'white',
    fontFamily: "Rubik-Bold",
    fontSize: 30,
    textAlign: 'center',
    padding: 10,

  },
  textLight: {
    fontSize: 30,
    fontFamily: 'Rubik',
    color: 'white',
    marginBottom: 20,
    marginHorizontal:20,
    alignSelf: 'center',
    textAlign: 'center'
  },
    
  text: {
    padding: 20,
    color: '#3C332A',
    fontSize: 24,
  },
  icon: {
    width: 50,
    height: 50,
    marginRight: 20,
  },
  menuContainer: {
    width: '85%',
    backgroundColor: 'transparent',
    justifyContent: 'center',
    alignItems: 'left',
    marginBottom: 30,
    borderColor: 'rgba(255, 255, 255, 1)',
    paddingHorizontal: 10,
  },
  menuItem: {
    fontFamily: "Rubik",
    height: 100,
    width: '80%',
    padding:10,
    alignSelf: 'center',
    alignItems:'center',
    borderRadius: 12,
    flexDirection: 'row',
    marginBottom: 20,
    marginHorizontal: 50,
    shadowColor: '#171717',
    shadowOffset: {width: -2, height: 4},
    shadowOpacity: 0.15,
    shadowRadius: 5,
    backgroundColor:'#F2902D',
  },
  hr: {
    borderColor: '#F3F2EF',
    borderWidth: 0.5,
    width: '100%',
  },

  logoutButton: {
    position: 'absolute',
    top: 50,
    right: 10,
  },

  logoutIcon: {
    width:40,
    height:40,
  },

  pager: {
    flex:1,
    borderRadius: 20,
    alignSelf: 'stretch',
    backgroundColor: 'transparent',
    alignContent: 'flex-start',
    justifyContent: 'center',
    paddingBottom: 200,
  }, 
  pagerimg: {
    backgroundColor: 'transparent',
    flex: 0.9,
    resizeMode: 'contain',
    marginBottom: 20,
    justifyContent: 'center',
    alignSelf: 'center',
    margin: 80,
    marginHorizontal:30,
    paddingHorizontal: 20,
    width: "90%",
    shadowColor: '#171717',
    shadowOffset: {width: 0, height:0},
    shadowOpacity: 0.8,
    shadowRadius: 10,
    overflow: 'visible'
  },
  intro: {
    padding:20,
    paddingTop: 0,
    fontSize: 30,
    fontFamily: "Rubik",
    textAlign: "left",
    textShadowColor: 'black',
    shadowOpacity: 1,
    textShadowRadius: 10,
  },
  gradient: {
    flex:1,
    borderRadius: 30,
  },
  blurContainer: {
    flex: 1,
    overflow: 'hidden',
  },
 
});

export default MainMenu;
