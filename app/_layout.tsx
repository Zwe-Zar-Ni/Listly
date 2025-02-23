import { SplashScreen, Stack } from "expo-router";
import { useFonts } from "expo-font";

import "../global.css";
import { useEffect } from "react";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { initiateDb } from "@/db/init";
import ThemeWrapper from "@/components/ui/gluestack-ui-provider/ThemeWrapper";
import { Alert } from "react-native";
import * as Notifications from "expo-notifications";

SplashScreen.preventAutoHideAsync();

const RootLayout = () => {
  const [fontsLoaded, error] = useFonts({
    "Poppins-Black": require("../assets/fonts/Poppins-Black.ttf"),
    "Poppins-Bold": require("../assets/fonts/Poppins-Bold.ttf"),
    "Poppins-ExtraBold": require("../assets/fonts/Poppins-ExtraBold.ttf"),
    "Poppins-ExtraLight": require("../assets/fonts/Poppins-ExtraLight.ttf"),
    "Poppins-Light": require("../assets/fonts/Poppins-Light.ttf"),
    "Poppins-Medium": require("../assets/fonts/Poppins-Medium.ttf"),
    "Poppins-Regular": require("../assets/fonts/Poppins-Regular.ttf"),
    "Poppins-SemiBold": require("../assets/fonts/Poppins-SemiBold.ttf"),
    "Poppins-Thin": require("../assets/fonts/Poppins-Thin.ttf")
  });

  useEffect(() => {
    if (!fontsLoaded && error) throw error;
    if (fontsLoaded) {
        SplashScreen.hideAsync();
    }
  }, [fontsLoaded, error]);

    useEffect(() => {
      (async () => {
        const { status: existingStatus } = await Notifications.getPermissionsAsync();
        let finalStatus = existingStatus;
        if (existingStatus !== 'granted') {
          const { status } = await Notifications.requestPermissionsAsync();
          finalStatus = status;
        }
        if (finalStatus !== 'granted') {
          alert('Failed to get push token for push notification!');
          return;
        }
      })();
    }, []);
    useEffect(() => {
      const subscription = Notifications.addNotificationReceivedListener(notification => {
        console.log("Notification received:", notification);
      });
    
      return () => subscription.remove();
    }, []);

  useEffect(() => {
    initiateDb().then(() => console.log('init db')).catch((err) => {
      Alert.alert(err, "Error initiating database.");
    });
  }, []);

  if (!fontsLoaded && !error) {
    return null;
  }

  return (
    <ThemeProvider>
      <ThemeWrapper>
        <Stack>
          <Stack.Screen
            name="index"
            options={{
              headerShown: false
            }}
          />
          <Stack.Screen
            name="(tabs)"
            options={{
              headerShown: false
            }}
          />
          <Stack.Screen
            name="categories"
            options={{
              headerShown: false
            }}
          />
          <Stack.Screen
            name="tasks/[id]"
            options={{
              headerShown: false
            }}
          />
        </Stack>
      </ThemeWrapper>
    </ThemeProvider>
  );
};

export default RootLayout;
