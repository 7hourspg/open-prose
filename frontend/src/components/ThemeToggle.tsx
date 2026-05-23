import { useTheme } from "next-themes";
import { IconBtn } from "@/components/window/Toolbar";
import { Icon } from "@/components/Icon";

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const isDark = theme !== "light";
  return (
    <IconBtn
      onClick={() => setTheme(isDark ? "light" : "dark")}
      title={isDark ? "Switch to light" : "Switch to dark"}
    >
      <Icon name={isDark ? "sun" : "moon"} size={14} />
    </IconBtn>
  );
}
