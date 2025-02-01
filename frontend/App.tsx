import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { restoreUserSession } from '@/redux/slices/authSlice';
import { AppDispatch } from '@/redux/store';

export default function App() {
  const dispatch = useDispatch<AppDispatch>();

  useEffect(() => {
    dispatch(restoreUserSession());
  }, [dispatch]);

  // ... diğer kodlar
} 