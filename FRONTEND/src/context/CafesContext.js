import { createContext, useState, useContext } from 'react';

const CafesContext = createContext();

export const CafesProvider = ({ children }) => {
  const [cafes, setCafes] = useState([]);


    function generateRandomBusyness() {
      const percent = Math.floor(Math.random() * 86) + 5; // 5 - 90
      let label = 'Moderate';
      if (percent < 35) label = 'Quiet';
      else if (percent >= 70) label = 'Busy';
      return { busyness: label, busynessPercent: percent };
    }

    const addCafe = (cafe) => {
      setCafes((prevCafes) => {
        if (prevCafes.some((c) => c.id === cafe.id)) return prevCafes;
        // Attach persistent busyness if not present
        const hasBusyness = cafe.busyness != null || cafe.busynessPercent != null || cafe.busyness_percent != null;
        const b = hasBusyness ? {} : generateRandomBusyness();
        return [...prevCafes, { ...cafe, ...b, savedAt: Date.now() }];
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
