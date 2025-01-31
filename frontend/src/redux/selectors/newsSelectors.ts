import { createSelector } from 'reselect';
import { RootState } from '../store';

const selectNewsState = (state: RootState) => state.news;

export const selectNews = createSelector(
  [selectNewsState],
  (newsState) => newsState.news
); 