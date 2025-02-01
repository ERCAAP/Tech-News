import { Tabs } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { useAppSelector } from '@/redux/hooks';
import { isUserAdmin } from '@/types';
import React from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { StyleSheet } from 'react-native';

export default function TabsLayout() {
  const { user } = useAppSelector(state => state.auth);

  return (
    <GestureHandlerRootView style={styles.container}>
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarStyle: { display: 'none' }, // Custom TabBar kullandığımız için gizliyoruz
        }}
      >
        <Tabs.Screen
          name="index"
          options={{
            title: 'Home',
            tabBarIcon: ({ color }) => (
              <MaterialIcons name="home" size={24} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="favorites"
          options={{
            title: 'Favorites',
            tabBarIcon: ({ color }) => (
              <MaterialIcons name="favorite" size={24} color={color} />
            ),
          }}
        />
        {isUserAdmin(user) && (
          <Tabs.Screen
            name="admin"
            options={{
              title: 'Admin',
              tabBarIcon: ({ color }) => (
                <MaterialIcons name="admin-panel-settings" size={24} color={color} />
              ),
            }}
          />
        )}
        <Tabs.Screen
          name="profile"
          options={{
            title: 'Profile',
            tabBarIcon: ({ color }) => (
              <MaterialIcons name="person" size={24} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="news/[slug]"
          options={{
            href: null, // Bu route'u tab bar'da gösterme
          }}
        />
        {user?.role === 'admin' && (
          <Tabs.Screen
            name="admin/stats"
            options={{
              title: 'Stats',
              tabBarIcon: ({ color }) => (
                <MaterialIcons name="analytics" size={24} color={color} />
              ),
            }}
          />
        )}
      </Tabs>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
}); 