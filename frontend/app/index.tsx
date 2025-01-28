import React, { useEffect } from "react";
import { StyleSheet, Text, View } from "react-native";
import { useNavigation } from "@react-navigation/native";

export default function Page() {
  const navigation = useNavigation(); // Navigation hook'u kullanarak yönlendirme kontrolü

  useEffect(() => {
    // Bu etki, bileşen yüklendiğinde login ekranına yönlendirecek
    const timeout = setTimeout(() => {
      navigation.navigate("Login"); // Login ekranına yönlendir
    }, 2000); // 2 saniye sonra yönlendirme yapılır

    return () => clearTimeout(timeout); // Bellek sızıntısını önlemek için temizleme
  }, [navigation]);

  return (
    <View style={styles.container}>
      <View style={styles.main}>
        <Text style={styles.title}>Hello World</Text>
        <Text style={styles.subtitle}>This is the first page of your app.</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    padding: 24,
  },
  main: {
    flex: 1,
    justifyContent: "center",
    maxWidth: 960,
    marginHorizontal: "auto",
  },
  title: {
    fontSize: 64,
    fontWeight: "bold",
  },
  subtitle: {
    fontSize: 36,
    color: "#38434D",
  },
});
