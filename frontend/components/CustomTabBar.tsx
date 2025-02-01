import { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { usePathname, router } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { COLORS } from '@/theme';
import { useAuth } from '@/hooks/useAuth';
import { API_URL } from '@/utils/api';

export function CustomTabBar() {
  const pathname = usePathname();
  const { user } = useAuth();
  const [favoriteCount, setFavoriteCount] = useState(0);

  // Favori sayısını getir
  useEffect(() => {
    if (user?._id) {
      fetchFavoriteCount();
    }
  }, [user?._id, pathname]);

  const fetchFavoriteCount = async () => {
    try {
      const response = await fetch(`${API_URL}/api/v1/news/favorites/count`, {
        headers: {
          'Authorization': `Bearer ${user?.token}`
        }
      });
      if (response.ok) {
        const data = await response.json();
        setFavoriteCount(data.count);
      }
    } catch (error) {
      console.error('Error fetching favorite count:', error);
    }
  };

  return (
    <View style={styles.container}>
      {/* ... diğer tablar ... */}
      
      <TouchableOpacity
        style={styles.tab}
        onPress={() => router.push('/favorites')}
      >
        <MaterialIcons
          name={pathname === '/favorites' ? 'favorite' : 'favorite-border'}
          size={24}
          color={pathname === '/favorites' ? COLORS.primary : COLORS.gray}
        />
        {favoriteCount > 0 && (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{favoriteCount}</Text>
          </View>
        )}
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  // ... diğer stiller ...
  badge: {
    position: 'absolute',
    top: -5,
    right: -5,
    backgroundColor: COLORS.primary,
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 2,
  },
  badgeText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
}); 