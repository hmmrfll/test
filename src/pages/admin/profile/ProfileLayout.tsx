import { NavLink, Outlet } from 'react-router-dom';
import { useAuthStore } from '../../../store/auth';
import { cn } from '../../../lib/utils';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../../components/ui/card';

export function ProfileLayout() {
  const user = useAuthStore((state) => state.user);
  const isOwner = user?.role === 'owner';

  const tabs = [
    { to: '/admin/profile', label: 'Профиль', end: true },
    ...(isOwner
      ? [
          { to: '/admin/profile/users', label: 'Пользователи' },
          { to: '/admin/profile/settings', label: 'Настройки' },
        ]
      : []),
  ];

  return (
    <div className="flex flex-col gap-6">
      <Card className="border-[rgb(var(--color-border))] bg-[rgb(var(--color-surface))] shadow-[0_30px_60px_-40px_rgba(78,115,248,0.28)] transition-colors">
        <CardHeader>
          <CardTitle>Здравствуйте, {user?.name}</CardTitle>
          <CardDescription>
            Управляйте личными данными, командой и настройками платформы KR Life.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-4 text-sm text-muted">
          <div>
            <span className="block text-xs uppercase tracking-wide text-muted">Email</span>
            <span className="font-medium text-foreground">{user?.email}</span>
          </div>
          <div>
            <span className="block text-xs uppercase tracking-wide text-muted">Роль</span>
            <span className="font-medium text-foreground">
              {user?.role === 'owner' ? 'Владелец' : user?.role === 'admin' ? 'Администратор' : 'Редактор'}
            </span>
          </div>
        </CardContent>
      </Card>

      <div className="flex flex-wrap gap-3">
        {tabs.map((tab) => (
          <NavLink
            key={tab.to}
            to={tab.to}
            end={tab.end}
            className={({ isActive }) =>
              cn(
                'rounded-full border border-[rgb(var(--color-border))] px-4 py-2 text-sm font-medium text-muted transition hover:border-[rgb(var(--color-border))]/80 hover:text-foreground',
                isActive ? 'border-[rgb(var(--color-primary))] text-foreground shadow-[0_10px_25px_-20px_rgba(78,115,248,0.6)]' : '',
              )
            }
          >
            {tab.label}
          </NavLink>
        ))}
      </div>

      <Outlet />
    </div>
  );
}

