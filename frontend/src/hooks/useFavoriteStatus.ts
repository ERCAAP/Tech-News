import { useQuery } from '@tanstack/react-query';
import { API_URL } from '@/utils/api';
import { useSelector } from 'react-redux';
import { RootState } from '@/redux/store';

export function useFavoriteStatus(newsId: string) {
  const { user } = useSelector((state: RootState) => state.auth);

  return useQuery({
    queryKey: ['favoriteStatus', newsId],
    queryFn: async () => {
      const response = await fetch(`${API_URL}/api/v1/news/${newsId}/favorite-status`, {
        headers: {
          'Authorization': `Bearer ${user?.token}`
        }
      });
      const data = await response.json();
      return data.data.isFavorited;
    },
    enabled: !!user && !!newsId
  });
} 