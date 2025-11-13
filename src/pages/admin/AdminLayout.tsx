import { NavLink, Outlet, useLocation } from 'react-router-dom';
import { useMemo, useState } from 'react';
import { Button } from '../../components/ui/button';
import {
	IconCompass,
	IconLogout,
	IconRocket,
	IconStackedLayers,
	IconUserCircle,
	IconMenu,
	IconClose,
} from '../../components/icons';
import { useAuthStore } from '../../store/auth';
import { cn } from '../../lib/utils';
import { ThemeToggle } from '../../components/theme-toggle';

const navItems = [
	{ to: '/admin/sources', label: 'Источники', description: 'Телеграм-каналы и сайты', icon: IconStackedLayers },
	{ to: '/admin/monitoring', label: 'Мониторинг', description: 'Редакция и модерация постов', icon: IconCompass },
	{ to: '/admin/released', label: 'Выпущенные', description: 'История опубликованных материалов', icon: IconRocket },
	{ to: '/admin/profile', label: 'Профиль', description: 'Настройки и команда', icon: IconUserCircle },
];

const roleLabel: Record<'owner' | 'admin' | 'editor', string> = {
	owner: 'Владелец',
	admin: 'Администратор',
	editor: 'Редактор',
};

export function AdminLayout() {
	const logout = useAuthStore((state) => state.logout);
	const user = useAuthStore((state) => state.user);
	const location = useLocation();
	const [mobileOpen, setMobileOpen] = useState(false);
	const [profileOpen, setProfileOpen] = useState(false);

	const currentSection = navItems.find((item) => location.pathname.startsWith(item.to))?.label ?? 'Обзор';
	const userInitials = useMemo(() => {
		if (!user?.name) return 'KR';
		const parts = user.name.trim().split(' ').filter(Boolean);
		if (parts.length === 0) return 'KR';
		if (parts.length === 1) return parts[0]!.slice(0, 2).toUpperCase();
		return (parts[0]![0] ?? '').concat(parts[1]![0] ?? '').toUpperCase();
	}, [user?.name]);

	const handleNavigate = () => setMobileOpen(false);
	const closeProfile = () => setProfileOpen(false);

	const navContent = (closeOnClick?: () => void) => (
		<nav className="flex flex-1 flex-col gap-2">
			{navItems.map((item) => {
				const Icon = item.icon;
				return (
					<NavLink
						key={item.to}
						to={item.to}
						onClick={closeOnClick}
						className={({ isActive }) =>
							cn(
								'group flex flex-col rounded-xl border border-transparent bg-[rgb(var(--color-surface))] px-4 py-4 transition-all duration-200 hover:-translate-y-px hover:border-[rgb(var(--color-border))] hover:shadow-sm dark:hover:border-[rgb(var(--color-border))]/80',
								isActive
									? 'border-[rgb(var(--color-primary))]/40 shadow-[0_18px_35px_-24px_rgba(78,115,248,0.55)] dark:border-[rgb(var(--color-primary))]/30 dark:shadow-[0_18px_38px_-24px_rgba(45,60,100,0.8)]'
									: 'border-[rgb(var(--color-border))]/40 dark:border-[rgb(var(--color-border))]/60',
							)
						}
					>
						<div className="flex items-center gap-3">
							<span className="flex h-10 w-10 items-center justify-center rounded-lg bg-[rgb(var(--color-secondary))] text-[rgb(var(--color-primary))] ring-1 ring-[rgb(var(--color-border))] transition group-hover:bg-[rgb(var(--color-secondary-hover))] dark:bg-[rgb(var(--color-secondary))]/40 dark:text-[rgb(var(--color-primary))] dark:ring-[rgb(var(--color-border))]/60">
								<Icon className="h-5 w-5" />
							</span>
							<div className="flex flex-col">
								<span className="text-sm font-medium text-[rgb(var(--color-foreground))]">{item.label}</span>
								<span className="text-xs text-[rgb(var(--color-muted-foreground))]">{item.description}</span>
							</div>
						</div>
					</NavLink>
				);
			})}
		</nav>
	);

	const userPanel = (
		<div className="flex flex-col gap-3 rounded-2xl border border-[rgb(var(--color-border))] bg-[rgb(var(--color-surface-elevated))] p-4 transition-colors">
			<div>
				<p className="text-xs text-[rgb(var(--color-muted-foreground))]">Вы вошли как</p>
				<p className="text-sm font-medium text-[rgb(var(--color-foreground))]">{user?.name}</p>
				<p className="text-xs text-[rgb(var(--color-muted-foreground))]">{user?.email}</p>
				<p className="mt-1 text-xs uppercase tracking-wide text-[rgb(var(--color-primary))]">
					{user ? roleLabel[user.role] : ''}
				</p>
			</div>
			<div className="flex items-center justify-between gap-3">
				<ThemeToggle />
				<Button
					onClick={logout}
					variant="ghost"
					className="flex items-center gap-2 rounded-full border border-transparent px-3 py-1 text-sm text-[rgb(var(--color-muted-foreground))] transition-colors hover:border-[rgb(var(--color-border))] hover:bg-[rgb(var(--color-secondary))] dark:hover:bg-[rgb(var(--color-secondary))]/40"
				>
					<IconLogout className="h-4 w-4" />
					<span>Выйти</span>
				</Button>
			</div>
		</div>
	);

	return (
		<div className="min-h-screen bg-[rgb(var(--color-background))] text-[rgb(var(--color-foreground))] transition-colors">
			<div className="flex min-h-screen">
				<aside className="hidden w-72 flex-col gap-6 border-r border-[rgb(var(--color-border))] bg-[rgb(var(--color-surface))] px-6 py-8 shadow-[0_25px_60px_-35px_rgba(78,115,248,0.25)] transition-colors dark:shadow-[0_28px_60px_-35px_rgba(16,20,40,0.8)] lg:flex">
					<div className="flex flex-col gap-2">
						<span className="text-xs uppercase tracking-[0.3em] text-[rgb(var(--color-muted-foreground))]">
							KR Life
						</span>
						<h1 className="text-2xl font-semibold text-[rgb(var(--color-foreground))]">Контент-платформа</h1>
						<p className="text-sm text-[rgb(var(--color-muted-foreground))]">
							Управление источниками и выпуском материалов
						</p>
					</div>
					{navContent()}
					{userPanel}
				</aside>

				<div className="flex min-h-screen flex-1 flex-col">
					<header className="relative flex items-center justify-between gap-4 border-b border-[rgb(var(--color-border))] bg-[rgb(var(--color-surface))] px-4 py-4 shadow-sm transition-colors lg:px-8">
						<div className="flex items-center gap-3">
							<Button
								type="button"
								variant="ghost"
								className="flex h-10 w-10 items-center justify-center rounded-full border border-[rgb(var(--color-border))] text-[rgb(var(--color-muted-foreground))] transition-colors hover:bg-[rgb(var(--color-secondary))] dark:hover:bg-[rgb(var(--color-secondary))]/40 lg:hidden"
								onClick={() => setMobileOpen(true)}
							>
								<IconMenu className="h-5 w-5" />
							</Button>
							<div>
								<p className="text-xs uppercase tracking-[0.25em] text-[rgb(var(--color-muted-foreground))]">
									Панель управления
								</p>
								<h2 className="text-xl font-semibold text-[rgb(var(--color-foreground))] transition-colors">
									{currentSection}
								</h2>
							</div>
						</div>
						<div className="flex items-center gap-3">
							<ThemeToggle />
							<Button
								type="button"
								variant="ghost"
								aria-haspopup="true"
								aria-expanded={profileOpen}
								onClick={() => setProfileOpen((prev) => !prev)}
								className="flex items-center gap-3 rounded-full border border-[rgb(var(--color-border))] px-2 py-1 text-sm text-[rgb(var(--color-muted-foreground))] transition-colors hover:border-[rgb(var(--color-border))]/80 hover:bg-[rgb(var(--color-secondary))] hover:text-[rgb(var(--color-foreground))] dark:hover:bg-[rgb(var(--color-secondary))]/40"
							>
								<span className="flex h-10 w-10 items-center justify-center rounded-full bg-[rgba(var(--color-primary),0.15)] text-base font-semibold text-[rgb(var(--color-primary))]">
									{userInitials}
								</span>
								<span className="hidden flex-col text-left leading-tight md:flex">
									<span className="font-medium text-[rgb(var(--color-foreground))]">{user?.name}</span>
									<span className="text-xs text-[rgb(var(--color-muted-foreground))]">
										{user ? roleLabel[user.role] : ''}
									</span>
								</span>
							</Button>
						</div>

						{profileOpen ? (
							<>
								<div
									className="fixed inset-0 z-40 bg-transparent"
									onClick={closeProfile}
								/>
								<div className="absolute right-4 top-[calc(100%+12px)] z-50 w-72 rounded-2xl border border-[rgb(var(--color-border))] bg-[rgb(var(--color-surface-elevated))] p-4 shadow-[0_24px_55px_-30px_rgba(78,115,248,0.35)] transition-colors">
									<div className="flex items-start gap-3">
										<span className="flex h-12 w-12 items-center justify-center rounded-full bg-[rgba(var(--color-primary),0.15)] text-lg font-semibold text-[rgb(var(--color-primary))]">
											{userInitials}
										</span>
										<div className="flex flex-col text-sm text-[rgb(var(--color-muted-foreground))]">
											<span className="text-base font-medium text-[rgb(var(--color-foreground))]">{user?.name}</span>
											<span>{user?.email}</span>
											<span className="text-xs uppercase tracking-wide text-[rgb(var(--color-primary))]">
												{user ? roleLabel[user.role] : ''}
											</span>
										</div>
									</div>
									<div className="mt-4 flex flex-col gap-2 text-sm">
										<NavLink
											to="/admin/profile"
											onClick={() => {
												closeProfile();
											}}
											className="rounded-lg border border-transparent px-3 py-2 text-[rgb(var(--color-muted-foreground))] transition-colors hover:border-[rgb(var(--color-border))] hover:bg-[rgb(var(--color-secondary))] hover:text-[rgb(var(--color-foreground))] dark:hover:bg-[rgb(var(--color-secondary))]/40"
										>
											Перейти в профиль
										</NavLink>
										<Button
											variant="ghost"
											onClick={() => {
												closeProfile();
												logout();
											}}
											className="flex items-center justify-between rounded-lg border border-transparent px-3 py-2 text-[rgb(var(--color-muted-foreground))] transition-colors hover:border-[rgb(var(--color-border))] hover:bg-[rgba(var(--color-destructive),0.12)] hover:text-[rgb(var(--color-destructive))]"
										>
											<span>Выйти</span>
											<IconLogout className="h-4 w-4" />
										</Button>
									</div>
								</div>
							</>
						) : null}
					</header>

					<main className="flex-1 bg-[rgb(var(--color-background))] transition-colors">
						<div className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-4 py-8 transition-colors lg:px-10">
							<Outlet />
						</div>
					</main>
				</div>
			</div>

			{mobileOpen ? (
				<div
					className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm transition-opacity lg:hidden"
					onClick={() => setMobileOpen(false)}
				>
					<div
						className="absolute left-0 top-0 flex h-full w-72 flex-col gap-6 bg-[rgb(var(--color-surface))] px-6 py-8 shadow-[0_30px_70px_-45px_rgba(78,115,248,0.45)] transition-transform dark:bg-[rgb(var(--color-surface))]/95"
						onClick={(event) => event.stopPropagation()}
					>
						<div className="flex items-center justify-between">
							<div className="flex flex-col">
								<span className="text-xs uppercase tracking-[0.3em] text-[rgb(var(--color-muted-foreground))]">
									KR Life
								</span>
								<span className="text-sm font-semibold text-[rgb(var(--color-foreground))]">Навигация</span>
							</div>
							<Button
								type="button"
								variant="ghost"
								className="h-10 w-10 rounded-full border border-[rgb(var(--color-border))] text-[rgb(var(--color-muted-foreground))] hover:bg-[rgb(var(--color-secondary))] dark:hover:bg-[rgb(var(--color-secondary))]/40"
								onClick={() => setMobileOpen(false)}
							>
								<IconClose className="h-5 w-5" />
							</Button>
						</div>
						{navContent(handleNavigate)}
						{userPanel}
					</div>
				</div>
			) : null}
		</div>
	);
}
