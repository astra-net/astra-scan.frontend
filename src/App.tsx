import { Box, Grommet } from "grommet";
import React, { useEffect } from "react";
import { BrowserRouter, useHistory } from "react-router-dom";
import { AppFooter } from "src/components/appFooter";
import { AppHeader } from "src/components/appHeader";
import { ERC1155_Pool } from "src/components/ERC1155_Pool";
import { ERC20_Pool } from "src/components/ERC20_Pool";
import { ERC721_Pool } from "src/components/ERC721_Pool";
import { BaseContainer, SearchInput } from "src/components/ui";
import { useThemeMode } from "src/hooks/themeSwitcherHook";
import { Routes } from "src/Routes";
import { Toaster, ToasterComponent } from "./components/ui/toaster";
import { ASTRA_USDT_Rate } from "./components/ASTRA_USDT_Rate";
import "./index.css";
import { darkTheme, theme } from "./theme";
import { SettingsService } from "./utils/settingsService/SettingsService";



export const toaster = new Toaster();
export const settingsService = new SettingsService();

function App() {
  if (document.location.hash && document.location.hash !== "#code") {
    document.location.href = `${
      document.location.origin
    }/${document.location.hash.slice(2)}`;
  }

  return (
    <BrowserRouter>
      <AppWithHistory />
    </BrowserRouter>
  );
}

let prevAddress = document.location.pathname;

function AppWithHistory() {
  const themeMode = useThemeMode();
  const history = useHistory();

  useEffect(() => {
    const unlisten = history.listen((location, action) => {
      if (prevAddress !== location.pathname) {
        prevAddress = location.pathname;
        const scrollBody = document.getElementById("scrollBody");
        if (scrollBody) {
          scrollBody.scrollTo({ top: 0 });
        }
      }
    });
    return () => {
      unlisten();
    };
  }, []);

  document.body.className = themeMode;

  return (
    <Grommet
      theme={themeMode === "light" ? theme : darkTheme}
      themeMode={themeMode}
      full
      id="scrollBody"
    >
      <ToasterComponent toaster={toaster} />
      <ERC20_Pool />
      <ERC721_Pool />
      <ERC1155_Pool />
      <Box
        background="backgroundBack"
        style={{ margin: "auto", minHeight: "100%" }}
      >
        <AppHeader style={{ flex: "0 0 auto" }} />
        <Box align="center" style={{ flex: "1 1 100%" }}>
          <BaseContainer>
            <SearchInput />
            <Routes />
          </BaseContainer>
        </Box>
        <AppFooter style={{ flex: "0 0 auto" }} />
        <ASTRA_USDT_Rate />
      </Box>
    </Grommet>
  );
}

export default App;
