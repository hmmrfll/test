import { FormEvent, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../../components/ui/card';
import { Input } from '../../../components/ui/input';
import { Button } from '../../../components/ui/button';
import { Badge } from '../../../components/ui/badge';
import { useAuthStore } from '../../../store/auth';

export function ProfileOverviewPage() {
  const user = useAuthStore((state) => state.user);
  const updateProfile = useAuthStore((state) => state.updateProfile);
  const [name, setName] = useState(user?.name ?? '');
  const [saved, setSaved] = useState(false);

  if (!user) {
    return null;
  }

  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!name.trim()) return;
    updateProfile({ name: name.trim() });
    setSaved(true);
    setTimeout(() => setSaved(false), 1500);
  };

  return (
    <div className="grid gap-6 md:grid-cols-[1.1fr_0.9fr]">
      <Card>
        <CardHeader>
          <CardTitle>Личные данные</CardTitle>
          <CardDescription>Измените отображаемое имя, которое используют коллеги в рабочей панели.</CardDescription>
        </CardHeader>
        <CardContent>
          <form className="flex flex-col gap-4" onSubmit={onSubmit}>
            <div className="flex flex-col gap-2">
              <label className="text-xs font-medium uppercase tracking-wide text-muted">Имя</label>
              <Input value={name} onChange={(event) => setName(event.target.value)} />
            </div>
            <Button type="submit" className="w-fit">
              Сохранить
            </Button>
            {saved ? <span className="text-xs text-emerald-500">Изменения сохранены</span> : null}
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Аккаунт</CardTitle>
          <CardDescription>Текущий статус и доступы в платформе.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4 text-sm text-muted">
          <div className="flex items-center justify-between">
            <span>Email</span>
            <span className="font-medium text-foreground">{user.email}</span>
          </div>
          <div className="flex items-center justify-between">
            <span>Роль</span>
            <Badge variant="secondary">
              {user.role === 'owner' ? 'Владелец' : user.role === 'admin' ? 'Администратор' : 'Редактор'}
            </Badge>
          </div>
          <div className="flex items-center justify-between">
            <span>Уровень доступа</span>
            <span className="text-xs uppercase tracking-wide text-emerald-600 dark:text-emerald-400">
              {user.role === 'owner' ? 'Полный' : user.role === 'admin' ? 'Расширенный' : 'Ограниченный'}
            </span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

