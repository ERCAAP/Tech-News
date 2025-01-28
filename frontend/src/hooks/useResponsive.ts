import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import { useWindowDimensions } from 'react-native';

export function useResponsive() {
  const { width, height } = useWindowDimensions();
  
  const isSmallDevice = width < 375;
  const isMediumDevice = width >= 375 && width < 768;
  const isLargeDevice = width >= 768;

  return {
    wp,
    hp,
    isSmallDevice,
    isMediumDevice,
    isLargeDevice,
    screenWidth: width,
    screenHeight: height,
  };
} 