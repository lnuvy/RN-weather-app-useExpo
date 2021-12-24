// import { Location } from 'expo-location';
import * as Location from 'expo-location';
import { StatusBar } from 'expo-status-bar';
import { useState, useEffect } from 'react';
import {
  ActivityIndicator,
  Dimensions,
  ScrollView,
  StyleSheet,
  Text,
  View
} from 'react-native';
import { Fontisto } from '@expo/vector-icons';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// 실제 API 키를 관리할때는 서버 등에 따로 보관해야함
const API_KEY = "4f1b7c5dd12bfe779ad1165b30bc7320"

const icons = {
  Clouds: "cloudy",
  Clear: "day-sunny",
  Atmosphere: "",
  Snow: "snow",
  Rain: "rains",
  Drizzle: "rain",
  Thunderstorm: "lightning"
}

export default function App() {
  const [country, setCountry] = useState("Loading...");
  const [region, setRegion] = useState("Loading...");
  const [city, setCity] = useState("Loading...");
  const [days, setDays] = useState([]);
  const [isAllowedPermission, setIsAllowedPermission] = useState(true);

  const getWeather = async () => {
    const { granted } = await Location.requestForegroundPermissionsAsync();
    if (!granted) {
      setIsAllowedPermission(false);
    }
    const {
      coords: {
        latitude,
        longitude
      }
    } = await Location.getCurrentPositionAsync({ accuraty: 5 })
    const location = await Location.reverseGeocodeAsync({ latitude, longitude }, { useGoogleMaps: false })
    setCity(location[0].city);
    setCountry(location[0].country);
    setRegion(location[0].region);

    const response = await fetch(
      `https://api.openweathermap.org/data/2.5/onecall?lat=${latitude}&lon=${longitude}&appid=${API_KEY}&units=metric`
    )
    const json = await response.json();
    setDays(json.daily);
    // console.log(json.daily);
    // console.log(json.daily[0].feels_like); // 체감기온
    // console.log(json.daily[0].temp.max); // 최고기온
    // console.log(json.daily[0].temp.min); // 최저기온
  }

  useEffect(() => {
    getWeather();
  }, []);

  return (
    <View style={styles.container}>

      {/* 상단 지역 정보 */}
      <View style={styles.city}>
        <Text style={styles.country}>{country}</Text>
        <View flexDirection="row">
          <Text style={{ ...styles.cityName, marginLeft: SCREEN_WIDTH / 10 }}> {region}</Text>
          <Text style={styles.cityName}> {city}</Text>
        </View>
      </View>

      {/* 날씨정보 컨테이너 */}
      <ScrollView
        pagingEnabled
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.weather}
      >
        {/* days.length === 0 */}
        {days.length === 0 ? (
          <View style={styles.day}>
            <ActivityIndicator color="white" size="large" />
          </View>
        ) : (
          days.map((day, index) => {
            return (
              <View key={index} style={styles.day}>
                <View
                  style={styles.tempContainer}>
                  <Text style={styles.temp}>{parseFloat(day.temp.day).toFixed(1)}</Text>
                  <Text style={styles.tempUnit}> &#8451;</Text>
                  <Fontisto
                    name={icons[day.weather[0].main]}
                    size={100}
                    color="white"
                    style={{ marginLeft: SCREEN_WIDTH / 15 }}
                  />
                </View>
                <Text style={styles.tinyText}>{day.weather[0].description}   </Text>

                {/* 최고, 최저기온 */}
                <View flexDirection="row">
                  <View flexDirection="row" style={styles.minmaxContainer}>
                    <Fontisto name="arrow-up" size={24} color="red" />
                    <Text style={styles.minmaxText}>{parseFloat(day.temp.max).toFixed(1)}&nbsp;</Text>
                    <Fontisto name="arrow-down" size={24} color="blue" />
                    <Text style={styles.minmaxText}>{parseFloat(day.temp.min).toFixed(1)}</Text>
                  </View>
                  <View style={{ flex: 1 }} />
                </View>
              </View>
            )
          }))
        }
      </ScrollView>
      <StatusBar style="light" />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "teal"
  },
  country: {
    fontSize: 25,
    fontWeight: "400",
  },
  city: {
    flex: 1.2,
    justifyContent: "center",
    alignItems: "center"
  },
  cityName: {
    flex: 1,
    fontSize: 40,
    fontWeight: "500",
    marginTop: 20,
  },
  weather: {
    // flex: 5,
    // backgroundColor: "tomato"
  },
  day: {
    width: SCREEN_WIDTH,
    // alignItems: 'center'
  },
  tempContainer: {
    flexDirection: "row",
  },
  temp: {
    fontSize: 110,
    color: "black",
  },
  tempUnit: {
    fontSize: 60,
    alignSelf: "center",
    color: "black",
  },
  tinyText: {
    fontSize: 26,
    color: "lightgray",
    alignSelf: "flex-end",
    marginTop: -25,
  },
  minmaxContainer: {
    justifyContent: "center",
    alignItems: "center",
    flex: 1
  },
  minmaxText: {
    fontSize: 28,
  },
})