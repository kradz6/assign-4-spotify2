import { StyleSheet, Text, SafeAreaView, Pressable, Image, FlatList, View, ImageBackground } from "react-native";
import { useState, useEffect } from "react";
import { ResponseType, useAuthRequest } from "expo-auth-session";
import { myTopTracks, albumTracks } from "./utils/apiOptions";
import { REDIRECT_URI, SCOPES, CLIENT_ID, ALBUM_ID } from "./utils/constants";
import millisToMinutesAndSeconds from "./utils/millisToMinuteSeconds.js"
import Colors from "./Themes/colors"
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { WebView } from "react-native-webview";
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';

// Endpoints for authorizing with Spotify
const discovery = {
  authorizationEndpoint: "https://accounts.spotify.com/authorize",
  tokenEndpoint: "https://accounts.spotify.com/api/token"
};

export default function App() {
  const [count, setCount] = useState(0);
  const [token, setToken] = useState("");
  const [tracks, setTracks] = useState([]);
  const [request, response, promptAsync] = useAuthRequest(
    {
      responseType: ResponseType.Token,
      clientId: CLIENT_ID,
      scopes: SCOPES,
      // In order to follow the "Authorization Code Flow" to fetch token after authorizationEndpoint
      // this must be set to false
      usePKCE: false,
      redirectUri: REDIRECT_URI
    },
    discovery
  );

  useEffect(() => {
    if (response?.type === "success") {
      const { access_token } = response.params;
      setToken(access_token);
    }
  }, [response]);

  useEffect(() => {
    if (token) {
      // TODO: Select which option you want: Top Tracks or Album Tracks

      // Comment out the one you are not using
      // myTopTracks(setTracks, token);
      albumTracks(ALBUM_ID, setTracks, token);
    }
  }, [token]);

  function SongScreen({ navigation, route }) {
    const params = route.params

    return <WebView source={{ uri: params.url }} />;
  }

  function PreviewScreen({ navigation, route }) {
    const params = route.params

    return <WebView source={{ uri: params.url }} />;
  }

  function Song({ name, artist, song, duration, imageUrl, number, externalUrl, previewUrl, route }) {
    const navigation = useNavigation();
    return (
    <>
    <View style={styles.item}>
      <View style={styles.playFlex}>
      <Pressable style={
          styles.play}
          onPress={() => navigation.navigate('PreviewScreen', {url: previewUrl})
            }>
          {({ pressed }) => (
            <>
            <Ionicons name="play-circle" size={32} color="green" />
            </>
          )}
      </Pressable>
      </View>
      <>
      <Pressable style={styles.info}
      onPress={() => navigation.navigate('SongScreen', {url: externalUrl})
      }>
      <Image
        style={styles.albumCover}
        source={{
          uri: imageUrl
        }}/>
      <View style={styles.textSection}>
        <Text style={styles.lightText} numberOfLines={1}>{song}</Text>
        <Text style={styles.darkText}>{artist}</Text>
      </View>
        <View style={styles.albumText}>
        <Text style={styles.lightText} numberOfLines={1}>{name}</Text>
      </View>
        <View style={styles.durText}>
        <Text style={styles.lightText}>{duration}</Text>
      </View>
      </Pressable>
      </>
    </View>
    </>
    );
  }

  const renderItem = (item, index) => (
    <Song
      name={item.album.name}
      artist={item.artists[0].name}
      song={item.name}
      duration={millisToMinutesAndSeconds(item.duration_ms)}
      imageUrl={item.album.images[1].url} 
      number= {index}
      externalUrl = {item.external_urls.spotify}
      previewUrl = {item.preview_url}
     />
  );

  function HomeScreen({ navigation }) {
    contentDisplayed = null;
    
    if (token) {
        contentDisplayed =
        <SafeAreaView style={styles.container}>
          <>
          <View style={styles.titleView}>
            <Image source={require('./assets/spotify-logo.png')} style={styles.spotLogo2}/>
            <Text style={styles.title} numberOfLines={1}>Christmas</Text>
          </View>
          <FlatList
            style={styles.list}
            data={tracks} // the array of data that the FlatList displays
            renderItem={({item, index}) => renderItem(item, index + 1)} // function that renders each item
            keyExtractor={(item) => item.id} // unique key for each item
          />
          </>
          </SafeAreaView>
      } else {
        contentDisplayed =
          <SafeAreaView style={styles.container}>
          <Pressable style={
            styles.button}
            onPress={() => {
              {promptAsync()}
            }}>
            {({ pressed }) => (
              <>
              <Image source={require('./assets/spotify-logo.png')} style={styles.spotLogo}/>
              <Text style={styles.buttonText}>
              CONNECT WITH SPOTIFY
              </Text>
              </>
            )}
            </Pressable>
            </SafeAreaView>
      }
    return contentDisplayed
  }

  console.log(tracks)

  const Stack = createNativeStackNavigator();

  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="HomeScreen">
        <Stack.Screen name="HomeScreen" component={HomeScreen} />
        <Stack.Screen name="SongScreen" component={SongScreen} />
        <Stack.Screen name="PreviewScreen" component={PreviewScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    display: 'flex',
    flexDirection: 'column',
    backgroundColor: Colors.background,
    justifyContent: "center",
    alignItems: "center",
    flex: 1
  },
  button: {
    flexDirection: 'row',
    justifyContent: "space-around",
    alignItems: "center",
    backgroundColor: Colors.spotify,
    height: '4%',
    width: '60%',
    borderRadius: 99999,
  },
  buttonText: {
    justifyContent: 'center',
    alignItems: 'center',
    color: 'white',
    fontWeight: 'bold',
  },
  spotLogo: {
    height: '70%',
    width: '10%',
    resizeMode: 'contain',
  },
  spotLogo2: {
    height: '30%',
    width: '10%',
    resizeMode: 'contain',
  },
  list: {
    height: '80%',
    width: '100%',
    backgroundColor: Colors.background,
    display: 'flex',
   // flexDirection: 'row',
  },
  playFlex: {
    display: 'flex',
    backgroundColor: Colors.background,
//    width: '10%',
//    height: '100%',
    flex: .5,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  item: {
    backgroundColor: Colors.background,
    padding: 3,
    marginVertical: 5,
    flex: 1,
    flexDirection: 'row',
  },
  info: {
    backgroundColor: Colors.background,
    height: '100%',
    padding: 10,
    flex: 5,
    flexDirection: 'row',
    justifyContent: 'space-between'
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: 'white',
  },
  titleView: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    color: 'blue',
  },
   textSection: {
    flex: 1.2,
  },
  lightText: {
    color: 'white',
  },
  darkText: {
    color: Colors.gray,
  },
  albumText: {
    flex: 1,
    justifyContent: 'center',
  },
  durText: {
    flex: 0.6,
    justifyContent: 'center',
  },
  albumCover: {
    height: '100%',
    width: '25%',
    resizeMode: 'contain',
  },
  play: {
    flex: 1,
 //   resizeMode: 'cover',
  }
});
