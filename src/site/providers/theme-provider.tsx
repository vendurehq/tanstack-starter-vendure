import {
	createContext,
	useContext,
	useEffect,
	useMemo,
	useState,
	type ReactNode,
} from "react";

export type Theme = "light" | "dark" | "system";

const ThemeContext = createContext<{
	theme: Theme;
	setTheme: (theme: Theme) => void;
} | null>(null);

function applyTheme(theme: Theme) {
	const dark =
		theme === "dark" ||
		(theme === "system" && matchMedia("(prefers-color-scheme: dark)").matches);
	document.documentElement.classList.toggle("dark", dark);
}

export function ThemeProvider({ children }: { children: ReactNode }) {
	const [theme, setThemeState] = useState<Theme>("system");

	useEffect(() => {
		const stored = localStorage.getItem("vendure-theme") as Theme | null;
		const initial = stored === "light" || stored === "dark" ? stored : "system";
		setThemeState(initial);
		applyTheme(initial);
	}, []);

	useEffect(() => {
		if (theme !== "system") return;
		const media = matchMedia("(prefers-color-scheme: dark)");
		const update = () => applyTheme("system");
		media.addEventListener("change", update);
		return () => media.removeEventListener("change", update);
	}, [theme]);

	const value = useMemo(
		() => ({
			theme,
			setTheme(next: Theme) {
				localStorage.setItem("vendure-theme", next);
				setThemeState(next);
				applyTheme(next);
			},
		}),
		[theme],
	);

	return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
	const value = useContext(ThemeContext);
	if (!value) throw new Error("useTheme must be used within ThemeProvider");
	return value;
}

export const themeScript = `(()=>{try{const t=localStorage.getItem('vendure-theme');const d=t==='dark'||((!t||t==='system')&&matchMedia('(prefers-color-scheme: dark)').matches);document.documentElement.classList.toggle('dark',d)}catch{}})()`;
