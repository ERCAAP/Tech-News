import React from 'react';
import { View, TouchableOpacity, StyleSheet, Platform, Dimensions } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { COLORS } from '@/theme';
import Animated, { 
  useAnimatedStyle, 
  withSpring, 
  withTiming,
  interpolateColor,
  useSharedValue,
  withSequence,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { BottomTabBarProps } from '@react-navigation/bottom-tabs';

type TabIconName = 'article' | 'search' | 'person';

interface TabItem {
  route: string;
  icon: TabIconName;
  label: string;
}

const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);
const { width: SCREEN_WIDTH } = Dimensions.get('window');

const tabs: TabItem[] = [
  { route: 'index', icon: 'article', label: 'News' },
  { route: 'search', icon: 'search', label: 'Search' },
  { route: 'profile', icon: 'person', label: 'Profile' }
];

export default function CustomTabBar({ state, navigation }: BottomTabBarProps) {
  const insets = useSafeAreaInsets();

  const bottomPadding = Platform.select({
    ios: Math.max(insets.bottom - 10, 0),
    android: 0,
  });

  const pressAnimations = React.useRef(tabs.map(() => useSharedValue(1))).current;

  return (
    <View style={[styles.container, { paddingBottom: bottomPadding }]}>
      <View style={styles.background}>
        {tabs.map((tab, index) => {
          const isActive = state.index === index;
          
          const animatedIconStyle = useAnimatedStyle(() => {
            const scale = pressAnimations[index].value;
            return {
              transform: [
                {
                  scale: withSpring(isActive ? 1.15 : scale, {
                    damping: 12,
                    stiffness: 200,
                  })
                }
              ],
              backgroundColor: withTiming(
                isActive ? `${COLORS.primary}20` : 'transparent',
                { duration: 150 }
              ),
            };
          });

          const animatedTextStyle = useAnimatedStyle(() => {
            return {
              transform: [
                {
                  translateY: withSpring(isActive ? -2 : 0, {
                    damping: 12,
                    stiffness: 200,
                  })
                }
              ],
              opacity: withTiming(isActive ? 1 : 0.7, { duration: 150 }),
              color: withTiming(
                isActive ? COLORS.primary : COLORS.gray,
                { duration: 150 }
              ),
            };
          });

          return (
            <AnimatedTouchable
              key={tab.route}
              style={[styles.tab]}
              onPress={() => {
                const event = navigation.emit({
                  type: 'tabPress',
                  target: tab.route,
                  canPreventDefault: true,
                });

                pressAnimations[index].value = withSequence(
                  withTiming(0.9, { duration: 50 }),
                  withTiming(1, { duration: 100 })
                );

                if (!isActive && !event.defaultPrevented) {
                  navigation.navigate(tab.route);
                }
              }}
              activeOpacity={1}
            >
              <Animated.View
                style={[
                  styles.iconContainer,
                  animatedIconStyle,
                ]}
              >
                <MaterialIcons
                  name={tab.icon}
                  size={24}
                  color={isActive ? COLORS.primary : COLORS.gray}
                />
              </Animated.View>
              <Animated.Text style={[
                styles.label,
                animatedTextStyle
              ]}>
                {tab.label}
              </Animated.Text>
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
      ios: 12,
      android: 16,
    }),
    paddingHorizontal: 12,
    width: '100%',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    ...Platform.select({
      ios: {
        shadowColor: COLORS.dark,
        shadowOffset: { width: 0, height: -4 },
        shadowOpacity: 0.08,
        shadowRadius: 16,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  tab: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    height: 52,
    position: 'relative',
  },
  iconContainer: {
    padding: 10,
    borderRadius: 16,
    backgroundColor: 'transparent',
  },
  label: {
    fontSize: 12,
    marginTop: 4,
    fontWeight: '600',
    letterSpacing: 0.3,
  },
}); 