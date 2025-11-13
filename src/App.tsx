import { Navigate, Outlet, Route, Routes } from 'react-router-dom';
import { AppProvider } from './providers/app-provider';
import { ThemeProvider } from './providers/theme-provider';
import { useAuthStore } from './store/auth';
import { LoginPage } from './pages/auth/LoginPage';
import { RegisterPage } from './pages/auth/RegisterPage';
import { AdminLayout } from './pages/admin/AdminLayout';
import { SourcesPage } from './pages/admin/SourcesPage';
import { MonitoringPage } from './pages/admin/MonitoringPage';
import { ReleasedPage } from './pages/admin/ReleasedPage';
import { ProfileLayout } from './pages/admin/profile/ProfileLayout';
import { ProfileOverviewPage } from './pages/admin/profile/ProfileOverviewPage';
import { ProfileUsersPage } from './pages/admin/profile/ProfileUsersPage';
import { ProfileSettingsPage } from './pages/admin/profile/ProfileSettingsPage';

export default function App() {
	return (
		<AppProvider>
			<ThemeProvider>
				<AppRoutes />
			</ThemeProvider>
		</AppProvider>
	);
}

function AppRoutes() {
	const isAuthenticated = useAuthStore((state) => Boolean(state.token));

	return (
		<Routes>
			<Route element={<PublicOnlyRoute />}>
				<Route
					path="/login"
					element={<LoginPage />}
				/>
				<Route
					path="/register"
					element={<RegisterPage />}
				/>
			</Route>

			<Route element={<ProtectedRoute />}>
				<Route
					path="/admin"
					element={<AdminLayout />}
				>
					<Route
						index
						element={
							<Navigate
								to="sources"
								replace
							/>
						}
					/>
					<Route
						path="sources"
						element={<SourcesPage />}
					/>
					<Route
						path="monitoring"
						element={<MonitoringPage />}
					/>
					<Route
						path="released"
						element={<ReleasedPage />}
					/>
					<Route
						path="profile"
						element={<ProfileLayout />}
					>
						<Route
							index
							element={<ProfileOverviewPage />}
						/>
						<Route
							path="users"
							element={<ProfileUsersPage />}
						/>
						<Route
							path="settings"
							element={<ProfileSettingsPage />}
						/>
					</Route>
				</Route>
			</Route>

			<Route
				path="*"
				element={
					<Navigate
						to={isAuthenticated ? '/admin/sources' : '/login'}
						replace
					/>
				}
			/>
		</Routes>
	);
}

function ProtectedRoute() {
	const token = useAuthStore((state) => state.token);
	if (!token) {
		return (
			<Navigate
				to="/login"
				replace
			/>
		);
	}
	return <Outlet />;
}

function PublicOnlyRoute() {
	const token = useAuthStore((state) => state.token);
	if (token) {
		return (
			<Navigate
				to="/admin/sources"
				replace
			/>
		);
	}
	return <Outlet />;
}
