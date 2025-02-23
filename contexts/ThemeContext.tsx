import React, { createContext, useContext, useEffect, useState } from "react";
import colors from "@/constants/colors";
import { getItem } from "@/db/settings";
const ThemeContext = createContext<any>(null);

type Pallatte = {
  key: string;
  primary: string;
  tint: string;
  bold: string;
  bg: string;
  text: string;
};

export const ThemeProvider = ({ children }: { children: React.ReactNode }) => {
  const [color, setColor] = useState("blue");
  const [mode, setMode] = useState("dark");
  const [pallatte, setPallatte] = useState<Pallatte>({
    ...colors[0],
    bg: "#ffffff",
    text: "#0f172a"
  });
  useEffect(() => {
    getItem('color').then((cl) => {
      const pl = colors.find((col) => col.key == cl);
      console.log(pl)
      if (pl) {
        setPallatte((pal) => {
          return {
            bg: pal.bg,
            text : pal.text,
            ...pl
          };
        });
      }  
    });
  }, [color]);

  useEffect(() => {
    getItem('mode').then((md) => {
      getItem('color').then((cl) => {
        const pl = colors.find((col) => col.key == cl);
        if(pl) {
          console.log('here')
          setPallatte({
            ...pl,
            bg: md == "light" ? "#ffffff" : "#161622",
            text: md == "light" ? "#0f172a" : "#ffffff"
          });
        } else {
          setPallatte({
            ...pallatte,
            bg: md == "light" ? "#ffffff" : "#161622",
            text: md == "light" ? "#0f172a" : "#ffffff"
          });
        }
        setMode(md ?? 'light');
      })
    })
  }, [mode]);
  return (
    <ThemeContext.Provider value={{ color, setColor, mode, setMode, pallatte }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);
