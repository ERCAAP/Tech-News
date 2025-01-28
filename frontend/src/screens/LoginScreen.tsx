import React from 'react';
import { View, Text, TextInput, Button, StyleSheet } from 'react-native';
import { useDispatch } from 'react-redux';
import { login } from '../redux/slices/userSlice';

export default function LoginScreen({ navigation }) {
  const dispatch = useDispatch();

  const handleLogin = () => {
    dispatch(login({ name: 'Kullanıcı', email: 'user@example.com' }));
    navigation.replace('Main');
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Giriş Yap</Text>
      <TextInput style={styles.input} placeholder="E-posta" />
      <TextInput style={styles.input} placeholder="Şifre" secureTextEntry />
      <Button title="Giriş" onPress={handleLogin} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  title: {
    fontSize: 24,
    marginBottom: 20,
  },
  input: {
    width: '100%',
    padding: 10,
    marginVertical: 5,
    borderWidth: 1,
    borderRadius: 5,
  },
});
