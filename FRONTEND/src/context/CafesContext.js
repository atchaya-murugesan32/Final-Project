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

  const persist = (nextCafes) => {
    AsyncStorage.setItem('my_saved_cafes', JSON.stringify(nextCafes)).catch(console.error);
  };

  const addCafe = (cafe) => {
    const cafeToSave = { ...cafe };
    setCafes((prevCafes) => {
      if (prevCafes.some((c) => c.id === cafeToSave.id)) return prevCafes;
      const newCafes = [...prevCafes, { ...cafeToSave, savedAt: Date.now() }];
      persist(newCafes);
      return newCafes;
    });
  };

  const removeCafe = (id) => {
    setCafes((prev) => {
      const newCafes = prev.filter((c) => c.id !== id);
      persist(newCafes);
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
