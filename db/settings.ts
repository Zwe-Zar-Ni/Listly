import AsyncStorage from '@react-native-async-storage/async-storage';

export const setItem = async (key : string,value : string) => {
    try {
      await AsyncStorage.setItem(key , value);
      return true;
    } catch (error) {
      console.error('Error setting item:', error);
      return false;
    }
  };

  export const getItem = async (key : string) => {
    try {
      const value = await AsyncStorage.getItem(key);
      return value;
    } catch (error) {
      console.error('Error getting item:', error);
      return null;
    }
  };
  
  export const mergeItems = async (key : string, value : string) => {
    try {
      await AsyncStorage.mergeItem(key, value);
      return true;
    } catch (error) {
      console.error('Error merging item:', error);
      return false;
    }
  };