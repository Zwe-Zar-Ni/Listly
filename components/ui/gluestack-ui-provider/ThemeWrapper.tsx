import React, { ReactElement } from "react";
import { GluestackUIProvider } from ".";
import { useTheme } from "@/contexts/ThemeContext";

const ThemeWrapper = ({ children }: { children: ReactElement }) => {
    const {mode} = useTheme();
  return <GluestackUIProvider mode={mode}>{children}</GluestackUIProvider>;
};

export default ThemeWrapper;
