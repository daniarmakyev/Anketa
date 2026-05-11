/** @type {import('tailwindcss').Config} */
export default {
	content: ["./index.html", "./src/**/*.{js,jsx}"],
	theme: {
		extend: {
			fontFamily: {
				display: ['"Playfair Display"', "serif"],
				body: ['"DM Sans"', "sans-serif"],
			},
			colors: {
				ink: {
					DEFAULT: "#1a1a2e",
					light: "#2d2d4e",
				},
				cream: {
					DEFAULT: "#f5f0e8",
					dark: "#ede7d9",
				},
				accent: {
					DEFAULT: "#c8a96e",
					dark: "#a8894e",
				},
				muted: "#8a8a9a",
			},
		},
	},
	plugins: [],
};
