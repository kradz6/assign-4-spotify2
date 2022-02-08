import { StyleSheet, Text, SafeAreaView, Pressable, Image, FlatList, View, ImageBackground } from "react-native";
import { useState, useEffect } from "react";
import { ResponseType, useAuthRequest } from "expo-auth-session";
import { myTopTracks, albumTracks } from "./utils/apiOptions";
import { REDIRECT_URI, SCOPES, CLIENT_ID, ALBUM_ID } from "./utils/constants";
import millisToMinutesAndSeconds from "./utils/millisToMinuteSeconds.js"
import Colors from "./Themes/colors"

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

  function Song({ name, artist, song, duration, imageUrl, number }) {
    return (
    <View style={styles.item}>
      <Text style={styles.darkText}>{number}</Text>
      <Image
        style={styles.albumCover}
        source={{
          uri: imageUrl
        }}
      />
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
    </View>
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
     />
  );

  let contentDisplayed = null;

  if (token) {
    contentDisplayed = 
        <>
        <View style={styles.titleView}>
          <Image source={require('./assets/spotify-logo.png')} style={styles.spotLogo2}/>
          <Text style={styles.title}>In Between Dreams</Text>
        </View>
        <FlatList
          style={styles.list}
          data={tracks} // the array of data that the FlatList displays
          renderItem={({item, index}) => renderItem(item, index + 1)} // function that renders each item
          keyExtractor={(item) => item.id} // unique key for each item
        />
        </>
  } else {
    contentDisplayed = 
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
  }

  console.log(tracks)

  return (
    <SafeAreaView style={styles.container}>
      {contentDisplayed}
    </SafeAreaView>
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
  },
  item: {
    backgroundColor: Colors.background,
    padding: 12,
    marginVertical: 5,
    flex: 1,
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
  }
});
