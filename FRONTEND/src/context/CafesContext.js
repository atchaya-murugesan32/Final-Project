import { createContext, useState, useContext, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const CafesContext = createContext();

export const CafesProvider = ({ children }) => {
  const [cafes, setCafes] = useState([]);

  useEffect(() => {
    AsyncStorage.getItem('my_saved_cafes').then(data => {
      if (data) setCafes(JSON.parse(data));
    }).catch(console.error);
  }, []);

  const addCafe = (cafe) => {
    setCafes((prevCafes) => {
      if (prevCafes.some((c) => c.id === cafe.id)) return prevCafes;
      const newCafes = [...prevCafes, { ...cafe, savedAt: Date.now() }];
      AsyncStorage.setItem('my_saved_cafes', JSON.stringify(newCafes)).catch(console.error);
      return newCafes;
    });
  };

  const removeCafe = (id) => {
    setCafes((prev) => {
      const newCafes = prev.filter((c) => c.id !== id);
      AsyncStorage.setItem('my_saved_cafes', JSON.stringify(newCafes)).catch(console.error);
      return newCafes;
    });
  };

   return (
    <CafesContext.Provider value={{ cafes, addCafe, removeCafe }}>
      {children}
    </CafesContext.Provider>
  );





}

// convenience hook
export function useCafes() {
  return useContext(CafesContext);
}
