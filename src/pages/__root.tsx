import { createRootRoute, Outlet } from "@tanstack/react-router";
import MenuBackground from "@/components/MenuBackground";
import { Toaster } from "@/components/ui/sonner";
import { DbProvider } from "@/contexts/DbProvider";
import { GameProvider } from "@/contexts/GameProvider";
import { SettingsProvider } from "@/contexts/SettingsProvider";

const RootComponent = () => (
	<DbProvider>
		<SettingsProvider>
			<GameProvider>
				<MenuBackground />
				<div className="flex flex-col w-full h-full items-center justify-center">
					<Outlet />
				</div>
				<Toaster />
			</GameProvider>
		</SettingsProvider>
	</DbProvider>
);

export const Route = createRootRoute({
	component: RootComponent,
});
