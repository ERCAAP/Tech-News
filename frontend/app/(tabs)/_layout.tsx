import { Tabs } from 'expo-router';
import React from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { StyleSheet, View } from 'react-native';
import CustomTabBar from '../../components/navigation/CustomTabBar';
import { COLORS } from '@/theme';
import { BottomTabBarProps } from '@react-navigation/bottom-tabs';

export default function TabsLayout() {
  return (
    <View style={styles.container}>
      <GestureHandlerRootView style={styles.content}>
        <Tabs 
          screenOptions={{
            headerShown: false,
            tabBarStyle: {
              display: 'none',
            },
          }}
          tabBar={(props: BottomTabBarProps) => <CustomTabBar {...props} />}
        >
          <Tabs.Screen
            name="index"
            options={{
              title: 'News',
              href: '/news',
            }}
          />
          <Tabs.Screen
            name="search"
            options={{
              title: 'Search',
            }}
          />
          <Tabs.Screen
            name="admin"
            options={{
              title: 'Write',
              href: null,
            }}
          />
          <Tabs.Screen
            name="profile"
            options={{
              title: 'Profile',
            }}
          />
          <Tabs.Screen
            name="news/[slug]"
            options={{
              href: null,
            }}
          />
        </Tabs>
      </GestureHandlerRootView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  content: {
    flex: 1,
  },
}); 