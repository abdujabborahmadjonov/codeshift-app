import { useState, useEffect } from "react";
import { LandingPage } from "./pages/LandingPage.jsx";
import { MigrationApp } from "./pages/MigrationApp.jsx";
import { MIGRATION_PATHS } from "./constants.js";
import { parseRoute, navigateTo } from "./lib/api.js";

export default function App() {
  const [route, setRoute] = useState(parseRoute);

  useEffect(() => {
    const sync = () => setRoute(parseRoute());
    window.addEventListener("hashchange", sync);
    if (!window.location.hash) navigateTo("landing");
    return () => window.removeEventListener("hashchange", sync);
  }, []);

  const launchApp = (pathId) => {
    navigateTo("app", pathId);
    setRoute({ page: "app", path: pathId || "js-ts" });
  };

  const goHome = () => {
    navigateTo("landing");
    setRoute({ page: "landing", path: null });
  };

  if (route.page === "app") {
    const validPath = MIGRATION_PATHS.some((p) => p.id === route.path) ? route.path : "js-ts";
    return <MigrationApp onBack={goHome} initialPath={validPath} />;
  }

  return <LandingPage onLaunch={launchApp} />;
}
