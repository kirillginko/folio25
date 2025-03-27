import { useGlobalState } from "../context/GlobalStateContext";
import ThemeButton from "./ThemeButton";

export default function Layout({ children }) {
  const { showThemeButton } = useGlobalState();

  return (
    <div>
      {showThemeButton && <ThemeButton />}
      {children}
    </div>
  );
}
