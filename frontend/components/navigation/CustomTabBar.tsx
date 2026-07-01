import React from 'react';
import { View, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { COLORS } from '@/theme';
import Animated, { 
  useAnimatedStyle, 
  withSpring, 
  withTiming,
  useSharedValue,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { useAppSelector } from '@/redux/hooks';
import { isUserAdmin } from '@/types';

type TabIconName = 'article' | 'search' | 'person' | 'edit';

interface TabItem {
  route: string;
  icon: TabIconName;
  label: string;
  adminOnly?: boolean;
  position: number;
}

const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);

const tabs: TabItem[] = [
  { route: 'index', icon: 'article', label: 'News', position: 0 },
  { route: 'search', icon: 'search', label: 'Search', position: 1 },
  { route: 'admin', icon: 'edit', label: 'Write', adminOnly: true, position: 2 },
  { route: 'profile', icon: 'person', label: 'Profile', position: 3 }
];

export default function CustomTabBar({ state, navigation }: BottomTabBarProps) {
  const user = useAppSelector(state => state.auth.user);
  const insets = useSafeAreaInsets();

  // Animasyon değerlerini tanımla
  const scaleValues = useSharedValue<number[]>(tabs.map(() => 1));
  const opacityValues = useSharedValue<number[]>(tabs.map(() => 1));

  const bottomPadding = Platform.select({
    ios: Math.max(insets.bottom - 10, 0),
    android: 0,
  });

  // Tab'ları düzenli bir şekilde filtrele ve sırala
  const visibleTabs = React.useMemo(() => {
    const filteredTabs = tabs.filter(tab => {
      // Admin kontrolü için güvenli kontrol ekleyelim
      if (tab.adminOnly) {
        return isUserAdmin(user);
      }
      return true;
    });
    return filteredTabs.sort((a, b) => a.position - b.position);
  }, [user]);

  // State indeksini görünür tab'lara göre ayarla
  const getVisibleIndex = React.useCallback((stateIndex: number) => {
    if (!state.routes[stateIndex]) return -1;
    
    const currentRoute = state.routes[stateIndex].name;
    return visibleTabs.findIndex(tab => tab.route === currentRoute);
  }, [visibleTabs, state.routes]);

  return (
    <View style={[styles.container, { paddingBottom: bottomPadding }]}>
      <View style={styles.background}>
        {visibleTabs.map((tab, index) => {
          const isActive = getVisibleIndex(state.index) === index;
          
          const animatedIconStyle = useAnimatedStyle(() => ({
            transform: [
              {
                scale: withSpring(
                  isActive ? 1.2 : 1, 
                  {
                    damping: 10,
                    stiffness: 100,
                    mass: 0.5,
                  }
                )
              },
              {
                translateY: withSpring(
                  isActive ? -4 : 0,
                  {
                    damping: 10,
                    stiffness: 100,
                    mass: 0.5,
                  }
                )
              }
            ],
          }));

          const animatedTextStyle = useAnimatedStyle(() => ({
            opacity: withTiming(isActive ? 1 : 0.5, { duration: 150 }),
            transform: [
              {
                translateY: withSpring(
                  isActive ? -2 : 0,
                  {
                    damping: 10,
                    stiffness: 100,
                    mass: 0.5,
                  }
                )
              }
            ],
            color: isActive ? COLORS.primary : COLORS.dark,
            fontWeight: isActive ? '700' : '600',
          }));

          const handlePress = React.useCallback(() => {
            const event = navigation.emit({
              type: 'tabPress',
              target: tab.route,
              canPreventDefault: true,
            });

            // Animasyonları doğrudan çalıştır
            scaleValues.value[index] = 0.8;
            opacityValues.value[index] = 0.5;

            // Animasyonları geri al
            setTimeout(() => {
              scaleValues.value[index] = 1;
              opacityValues.value[index] = 1;
            }, 100);

            if (!isActive && !event.defaultPrevented) {
              navigation.navigate(tab.route);
            }
          }, [tab.route, isActive, navigation, index]);

          return (
            <AnimatedTouchable
              key={tab.route}
              style={[styles.tab]}
              onPress={handlePress}
              activeOpacity={1}
            >
              <View style={styles.tabContent}>
                <Animated.View style={[styles.iconContainer, animatedIconStyle]}>
                  <MaterialIcons
                    name={tab.icon}
                    size={26}
                    color={isActive ? COLORS.primary : COLORS.dark}
                  />
                </Animated.View>
                <Animated.Text style={[styles.label, animatedTextStyle]}>
                  {tab.label}
                </Animated.Text>
              </View>
            </AnimatedTouchable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
  background: {
    flexDirection: 'row',
    backgroundColor: COLORS.white,
    paddingTop: 12,
    paddingBottom: Platform.select({
      ios: 16,
      android: 20,
    }),
    paddingHorizontal: 12,
    width: '100%',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    ...Platform.select({
      ios: {
        shadowColor: COLORS.dark,
        shadowOffset: { width: 0, height: -4 },
        shadowOpacity: 0.1,
        shadowRadius: 16,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  tab: {
    flex: 1,
    height: 65,
    position: 'relative',
  },
  tabContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 8,
  },
  iconContainer: {
    height: 28,
    width: 28,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'transparent',
    marginBottom: 4,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    letterSpacing: 0.3,
    marginTop: 2,
  },
}); 