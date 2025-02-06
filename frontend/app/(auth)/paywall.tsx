import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Text, Dimensions, TouchableOpacity, Platform, Animated, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { MaterialIcons } from '@expo/vector-icons';
import { COLORS, FONTS } from '@/theme';
import { Button } from '@/components/common/Button';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { useAppDispatch } from '@/redux/hooks';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { API_URL } from '@/config';

const { width } = Dimensions.get('window');

const subscriptionPlans = [
  {
    id: '1',
    duration: '1 Year',
    price: '$119.99',
    perMonth: '$9.99',
    label: 'yearly',
    type: 'yearly',
    isBestValue: true
  },
  {
    id: '2',
    duration: '1 Month',
    price: '$14.99',
    perMonth: '$14.99',
    label: 'monthly',
    type: 'monthly'
  }
];

const features = [
  {
    icon: 'article',
    title: 'Unlimited Articles',
    description: 'Access all premium articles and exclusive content'
  }
];

// Update the response interface to match backend
interface SubscriptionResponse {
  status: string;
  data: {
    user: {
      isSubscription: boolean;
      subscriptionPlan: string;
      subscriptionEndDate: string | null;
    };
  };
  success: boolean;
}

const PaywallScreen = () => {
  const dispatch = useAppDispatch();
  const [selectedPlan, setSelectedPlan] = useState(subscriptionPlans[1].id);
  const [isLoading, setIsLoading] = useState(false);
  const fadeAnim = useState(new Animated.Value(0))[0];

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();
  }, []);

  const handleContinue = async () => {
    try {
      setIsLoading(true);
      
      const plan = subscriptionPlans.find(p => p.id === selectedPlan);
      if (!plan) return;

      const endDate = new Date();
      if (plan.type === 'yearly') {
        endDate.setFullYear(endDate.getFullYear() + 1);
      } else {
        endDate.setMonth(endDate.getMonth() + 1);
      }

      // Just update local storage
      await AsyncStorage.setItem('isSubscription', 'true');
      await AsyncStorage.setItem('subscriptionPlan', plan.type);
      await AsyncStorage.setItem('subscriptionEndDate', endDate.toISOString());
      
      Alert.alert(
        'Success',
        'Your subscription has been activated successfully!',
        [
          {
            text: 'OK',
            onPress: () => router.replace('/(tabs)')
          }
        ]
      );
    } catch (error) {
      Alert.alert(
        'Error',
        'An error occurred. Please try again.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="light" />
      <LinearGradient
        colors={['#1a237e', '#283593', '#303f9f']}
        style={styles.container}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <Animated.View 
          style={[styles.content, {
            opacity: fadeAnim,
            transform: [{
              translateY: fadeAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [50, 0],
              })
            }]
          }]}
        >
          <View style={styles.header}>
            <MaterialIcons name="newspaper" size={48} color={COLORS.white} />
            <Text style={styles.title}>Premium Access</Text>
            <Text style={styles.subtitle}>
              Get unlimited access to premium content
            </Text>
          </View>

          <View style={styles.featuresContainer}>
            {features.map((feature, index) => (
              <View key={index} style={styles.featureItem}>
                <View style={styles.featureIcon}>
                  <MaterialIcons name={feature.icon as any} size={24} color={COLORS.primary} />
                </View>
                <View style={styles.featureText}>
                  <Text style={styles.featureTitle}>{feature.title}</Text>
                  <Text style={styles.featureDescription}>{feature.description}</Text>
                </View>
              </View>
            ))}
          </View>

          <View style={styles.plansContainer}>
            {subscriptionPlans.map((plan) => (
              <TouchableOpacity
                key={plan.id}
                style={[
                  styles.planCard,
                  selectedPlan === plan.id && styles.selectedPlan,
                  plan.isBestValue && styles.bestValuePlan
                ]}
                onPress={() => setSelectedPlan(plan.id)}
              >
                {plan.isBestValue && (
                  <View style={styles.bestValueBadge}>
                    <Text style={styles.bestValueText}>BEST VALUE</Text>
                  </View>
                )}
                <Text style={styles.planDuration}>{plan.duration}</Text>
                <Text style={styles.planPrice}>{plan.price}</Text>
                <Text style={styles.planPerMonth}>{plan.perMonth} / month</Text>
              </TouchableOpacity>
            ))}
          </View>

          <Button
            title={isLoading ? "Processing..." : "Continue"}
            onPress={handleContinue}
            style={styles.button}
            disabled={isLoading}
            isLoading={isLoading}
          />

          <View style={styles.footerButtons}>
            <View style={styles.footerButtonRow}>
              <TouchableOpacity 
                style={styles.footerButton}
                onPress={() => {/* Handle restore purchases */}}
              >
                <Text style={styles.footerButtonText}>Restore</Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={styles.footerButton}
                onPress={() => router.push('/privacy')}
              >
                <Text style={styles.footerButtonText}>Privacy</Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={styles.footerButton}
                onPress={() => router.push('/terms')}
              >
                <Text style={styles.footerButtonText}>Terms</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Animated.View>
      </LinearGradient>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
  },
  title: {
    fontSize: 28,
    fontFamily: FONTS.bold,
    color: COLORS.white,
    marginTop: 16,
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    fontFamily: FONTS.regular,
    color: COLORS.white + 'CC',
    textAlign: 'center',
    marginBottom: 24,
  },
  featuresContainer: {
    marginBottom: 32,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  featureIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.white,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  featureText: {
    flex: 1,
  },
  featureTitle: {
    fontSize: 16,
    fontFamily: FONTS.medium,
    color: COLORS.white,
    marginBottom: 4,
  },
  featureDescription: {
    fontSize: 14,
    fontFamily: FONTS.regular,
    color: COLORS.white + 'CC',
  },
  plansContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  planCard: {
    width: '48%',
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    ...Platform.select({
      ios: {
        shadowColor: 'rgba(0,0,0,0.1)',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  selectedPlan: {
    borderColor: COLORS.primary,
    borderWidth: 2,
  },
  bestValuePlan: {
    backgroundColor: COLORS.white,
  },
  bestValueBadge: {
    position: 'absolute',
    top: -12,
    paddingHorizontal: 12,
    paddingVertical: 4,
    backgroundColor: COLORS.primary,
    borderRadius: 12,
  },
  bestValueText: {
    color: COLORS.white,
    fontSize: 12,
    fontFamily: FONTS.bold,
  },
  planDuration: {
    fontSize: 18,
    fontFamily: FONTS.bold,
    color: COLORS.dark,
    marginBottom: 8,
  },
  planPrice: {
    fontSize: 24,
    fontFamily: FONTS.bold,
    color: COLORS.primary,
    marginBottom: 4,
  },
  planPerMonth: {
    fontSize: 14,
    fontFamily: FONTS.regular,
    color: COLORS.gray,
  },
  button: {
    backgroundColor: COLORS.primary,
    borderRadius: 12,
    height: 56,
    marginBottom: 16,
  },
  footerButtons: {
    marginTop: 20,
    alignItems: 'center',
  },
  footerButtonRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    paddingHorizontal: 20,
  },
  footerButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 8,
  },
  footerButtonText: {
    color: COLORS.white,
    fontSize: 14,
    fontFamily: FONTS.medium,
  },
});

export default PaywallScreen; 