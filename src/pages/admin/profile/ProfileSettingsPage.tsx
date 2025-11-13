import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../../components/ui/card';
import { Switch } from '../../../components/ui/switch';
import { Select } from '../../../components/ui/select';
import { useAuthStore } from '../../../store/auth';
import { useContentStore } from '../../../store/content';

export function ProfileSettingsPage() {
  const currentUser = useAuthStore((state) => state.user);
  const settings = useContentStore((state) => state.settings);
  const updateSettings = useContentStore((state) => state.updateSettings);

  if (currentUser?.role !== 'owner') {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Недостаточно прав</CardTitle>
          <CardDescription>Настройки платформы доступны только владельцу.</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Настройки платформы</CardTitle>
        <CardDescription>Определите правила автоматизации и поведения парсеров.</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-6">
        <div className="flex items-center justify-between gap-4 rounded-2xl border border-[rgb(var(--color-border))] bg-[rgb(var(--color-surface-elevated))] px-4 py-3 transition-all duration-200 hover:border-[rgb(var(--color-border))]/80 hover:bg-[rgba(var(--color-muted),0.6)]">
          <div className="max-w-md text-sm text-muted">
            <span className="block font-medium text-foreground">Автопубликация</span>
            <span>Автоматически отправлять одобренные материалы без ручного подтверждения.</span>
          </div>
          <Switch checked={settings.autoPublishEnabled} onCheckedChange={(checked) => updateSettings({ autoPublishEnabled: checked })} />
        </div>

        <div className="flex items-center justify-between gap-4 rounded-2xl border border-[rgb(var(--color-border))] bg-[rgb(var(--color-surface-elevated))] px-4 py-3 transition-all duration-200 hover:border-[rgb(var(--color-border))]/80 hover:bg-[rgba(var(--color-muted),0.6)]">
          <div className="max-w-md text-sm text-muted">
            <span className="block font-medium text-foreground">Парсер</span>
            <span>Отключите, если требуется остановить внешние сборщики контента.</span>
          </div>
          <Switch checked={settings.parserEnabled} onCheckedChange={(checked) => updateSettings({ parserEnabled: checked })} />
        </div>

        <div className="flex items-center justify-between gap-4 rounded-2xl border border-[rgb(var(--color-border))] bg-[rgb(var(--color-surface-elevated))] px-4 py-3 transition-all duration-200 hover:border-[rgb(var(--color-border))]/80 hover:bg-[rgba(var(--color-muted),0.6)]">
          <div className="max-w-md text-sm text-muted">
            <span className="block font-medium text-foreground">Язык по умолчанию</span>
            <span>Определяет язык для новых материалов и промтов форматирования.</span>
          </div>
          <Select
            value={settings.defaultLanguage}
            onChange={(event) => updateSettings({ defaultLanguage: event.target.value as typeof settings.defaultLanguage })}
            className="w-32"
          >
            <option value="ru">Русский</option>
            <option value="en">Английский</option>
          </Select>
        </div>
      </CardContent>
    </Card>
  );
}

