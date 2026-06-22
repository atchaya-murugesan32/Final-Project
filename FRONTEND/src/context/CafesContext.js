import { createContext, useState, useContext } from 'react';

const CafesContext = createContext();

export const CafesProvider = ({ children }) => {
  const [cafes, setCafes] = useState([]);


    const addCafe = (cafe) => {
        setCafes((prevCafes) => {
            if (prevCafes.some((c) => c.id === cafe.id)) return prevCafes;
            return [...prevCafes, { ...cafe, savedAt: Date.now() }];
        });
    };

    const removeCafe = (id) => {
    setCafes((prev) => prev.filter((c) => c.id !== id));
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
