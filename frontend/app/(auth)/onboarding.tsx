import React, { useState, useRef } from 'react';
import { View, Text, StyleSheet, Dimensions, FlatList, TouchableOpacity, Image } from 'react-native';
import { COLORS, FONTS } from '@/theme';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';

const { width } = Dimensions.get('window');

const OnboardingImage1 = () => (
  <View style={styles.illustrationContainer}>
    <MaterialIcons name="article" size={80} color={COLORS.primary} />
    <View style={styles.notificationBadge}>
      <MaterialIcons name="notifications" size={32} color={COLORS.white} />
    </View>
    <View style={styles.deviceFrame}>
      <MaterialIcons name="devices" size={40} color={COLORS.gray} />
    </View>
  </View>
);

const OnboardingImage2 = () => (
  <View style={styles.illustrationContainer}>
    <View style={styles.featureIconsContainer}>
      <View style={[styles.featureIcon, { backgroundColor: COLORS.primary + '20' }]}>
        <MaterialIcons name="translate" size={32} color={COLORS.primary} />
      </View>
      <View style={[styles.featureIcon, { backgroundColor: COLORS.success + '20' }]}>
        <MaterialIcons name="language" size={32} color={COLORS.success} />
      </View>
      <View style={[styles.featureIcon, { backgroundColor: COLORS.warning + '20' }]}>
        <MaterialIcons name="chat" size={32} color={COLORS.warning} />
      </View>
    </View>
  </View>
);

const slides = [
  {
    id: '1',
    title: 'Latest Tech News',
    description: 'Stay updated with the latest technology news from around the world. Get instant notifications for breaking news.',
    ImageComponent: OnboardingImage1,
    features: ['Real-time updates', 'Push notifications', 'Breaking news alerts']
  },
  {
    id: '2',
    title: 'News Features',
    description: 'Enjoy a seamless news reading experience with our powerful features. Save your favorites and customize your feed.',
    ImageComponent: OnboardingImage2,
    features: ['Customizable feed', 'Easy sharing']
  }
];

export default function OnboardingScreen() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const flatListRef = useRef<FlatList>(null);

  const handleNext = () => {
    if (currentIndex < slides.length - 1) {
      flatListRef.current?.scrollToIndex({ index: currentIndex + 1 });
      setCurrentIndex(currentIndex + 1);
    } else {
      handleFinish();
    }
  };

  const handleFinish = async () => {
    try {
      await AsyncStorage.setItem('hasSeenOnboarding', 'true');
      router.replace('/(auth)/login');
    } catch (error) {
      console.error('Error saving onboarding status:', error);
    }
  };

  const renderSlide = ({ item }: { item: typeof slides[0] }) => (
    <View style={styles.slide}>
      <item.ImageComponent />
      
      <Animated.View 
        entering={FadeIn.delay(300)} 
        exiting={FadeOut}
        style={styles.textContainer}
      >
        <Text style={styles.title}>{item.title}</Text>
        <Text style={styles.description}>{item.description}</Text>
        
        <View style={styles.featuresList}>
          {item.features.map((feature, idx) => (
            <View key={idx} style={styles.featureItem}>
              <MaterialIcons name="check-circle" size={20} color={COLORS.primary} />
              <Text style={styles.featureText}>{feature}</Text>
            </View>
          ))}
        </View>
      </Animated.View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <FlatList
        ref={flatListRef}
        data={slides}
        renderItem={renderSlide}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={(e) => {
          const index = Math.round(e.nativeEvent.contentOffset.x / width);
          setCurrentIndex(index);
        }}
      />

      <View style={styles.footer}>
        <View style={styles.pagination}>
          {slides.map((_, index) => (
            <View
              key={index}
              style={[
                styles.paginationDot,
                index === currentIndex && styles.paginationDotActive
              ]}
            />
          ))}
        </View>

        <TouchableOpacity 
          style={styles.button} 
          onPress={handleNext}
        >
          <Text style={styles.buttonText}>
            {currentIndex === slides.length - 1 ? 'Get Started' : 'Next'}
          </Text>
          <MaterialIcons 
            name={currentIndex === slides.length - 1 ? 'login' : 'arrow-forward'} 
            size={24} 
            color={COLORS.white} 
          />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  slide: {
    width,
    alignItems: 'center',
    padding: 20,
  },
  image: {
    width: width * 0.8,
    height: width * 0.8,
    marginVertical: 20,
  },
  textContainer: {
    alignItems: 'center',
    marginTop: 20,
  },
  title: {
    fontSize: 28,
    fontFamily: FONTS.bold,
    color: COLORS.dark,
    marginBottom: 12,
    textAlign: 'center',
  },
  description: {
    fontSize: 16,
    fontFamily: FONTS.regular,
    color: COLORS.gray,
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 24,
  },
  featuresList: {
    alignItems: 'flex-start',
    width: '100%',
    paddingHorizontal: 20,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  featureText: {
    fontSize: 16,
    fontFamily: FONTS.medium,
    color: COLORS.dark,
    marginLeft: 8,
  },
  footer: {
    padding: 20,
  },
  pagination: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 20,
  },
  paginationDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.gray + '40',
    marginHorizontal: 4,
  },
  paginationDotActive: {
    backgroundColor: COLORS.primary,
    width: 20,
  },
  button: {
    backgroundColor: COLORS.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
  },
  buttonText: {
    color: COLORS.white,
    fontSize: 18,
    fontFamily: FONTS.medium,
    marginRight: 8,
  },
  illustrationContainer: {
    width: width * 0.8,
    height: width * 0.8,
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 20,
    position: 'relative',
  },
  notificationBadge: {
    position: 'absolute',
    top: '20%',
    right: '20%',
    backgroundColor: COLORS.primary,
    borderRadius: 30,
    padding: 12,
    elevation: 4,
    shadowColor: COLORS.dark,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  deviceFrame: {
    position: 'absolute',
    bottom: '20%',
    left: '20%',
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 12,
    elevation: 4,
    shadowColor: COLORS.dark,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  featureIconsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    paddingHorizontal: 20,
  },
  featureIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    margin: 8,
    elevation: 2,
    shadowColor: COLORS.dark,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
}); 