import { useQuery, useQueryClient } from '@tanstack/react-query';
import { API_URL } from '@/utils/api';
import { useSelector } from 'react-redux';
import { RootState } from '@/redux/store';
import { NewsItem } from '@/types';

export function useFavorites() {
  const { user } = useSelector((state: RootState) => state.auth);
  const queryClient = useQueryClient();

  const { data: favorites, isLoading } = useQuery<NewsItem[]>({
    queryKey: ['favoriteNews'],
    queryFn: async () => {
      if (!user?.token) return [];
      
      const response = await fetch(`${API_URL}/api/v1/news/user/favorites`, {
        headers: {
          'Authorization': `Bearer ${user.token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch favorites');
      }

      const data = await response.json();
      return data.data.news;
    },
    enabled: !!user?.token
  });

  const invalidateFavorites = () => {
    queryClient.invalidateQueries({ queryKey: ['favoriteNews'] });
  };

  return {
    favorites,
    isLoading,
    invalidateFavorites
  };
} 