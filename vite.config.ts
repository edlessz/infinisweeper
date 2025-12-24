import path from "node:path";
import tailwindcss from "@tailwindcss/vite";
import { tanstackRouter } from "@tanstack/router-plugin/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import { VitePWA } from "vite-plugin-pwa";

// https://vite.dev/config/
export default defineConfig({
	plugins: [
		tanstackRouter({
			routesDirectory: "./src/pages",
			generatedRouteTree: "./src/routeTree.gen.ts",
		}),
		react(),
		tailwindcss(),
		VitePWA({
			registerType: "autoUpdate",
			includeAssets: [
				"images/**/*",
				"icons/**/*",
				"audio/**/*",
				"changelog.json",
				"subtexts.json",
			],
			manifest: {
				name: "infinisweeper",
				short_name: "infinisweeper",
				theme_color: "#AAD650",
				background_color: "#E4C29E",
				description: "Infinite, never-ending Minesweeper. Good luck.",
				icons: [
					{
						src: "images/flag-192.png",
						sizes: "192x192",
						type: "image/png",
					},
					{
						src: "images/flag-512.png",
						sizes: "512x512",
						type: "image/png",
					},
				],
			},
		}),
	],
	server: {
		host: true,
	},
	resolve: {
		alias: {
			"@": path.resolve(__dirname, "./src"),
		},
	},
});
