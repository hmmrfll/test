import { useMemo, useState } from 'react';
import type { FormEvent } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Input } from '../../components/ui/input';
import { Select } from '../../components/ui/select';
import { Button } from '../../components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/table';
import { SourceStatusBadge } from '../../components/status-badge';
import { useContentStore } from '../../store/content';
import type { SourceType, Source } from '../../types/content';
import { IconFilter } from '../../components/icons';
import { IconPause, IconPlay, IconSettings } from '../../components/icons';
import { Textarea } from '../../components/ui/textarea';

type Filters = {
  query: string;
  type: SourceType | 'all';
  status: Source['status'] | 'all';
};

export function SourcesPage() {
  const { sources, addSource, updateSourceStatus, updateSourcePrompts } = useContentStore();
  const [filters, setFilters] = useState<Filters>({ query: '', type: 'all', status: 'all' });
  const [formState, setFormState] = useState({
    title: '',
    handle: '',
    type: 'telegram' as SourceType,
    filterPrompt: '',
    formatPrompt: '',
  });
  const [editingSource, setEditingSource] = useState<Source | null>(null);
  const [editPrompts, setEditPrompts] = useState({ filterPrompt: '', formatPrompt: '' });

  const filteredSources = useMemo(() => {
    return sources.filter((source) => {
      const matchesQuery =
        filters.query.length === 0 ||
        source.title.toLowerCase().includes(filters.query.toLowerCase()) ||
        source.handle.toLowerCase().includes(filters.query.toLowerCase());
      const matchesType = filters.type === 'all' || source.type === filters.type;
      const matchesStatus = filters.status === 'all' || source.status === filters.status;
      return matchesQuery && matchesType && matchesStatus;
    });
  }, [filters, sources]);

  const totals = useMemo(() => {
    const byType = sources.reduce(
      (acc, source) => {
        acc[source.type] += 1;
        return acc;
      },
      { telegram: 0, website: 0 },
    );
    const active = sources.filter((source) => source.status === 'active').length;
    return { byType, active, total: sources.length };
  }, [sources]);

  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!formState.title || !formState.handle) return;
    addSource({
      ...formState,
      status: 'active',
    });
    setFormState((current) => ({ ...current, title: '', handle: '', filterPrompt: '', formatPrompt: '' }));
  };

  const handleStatusToggle = (source: Source) => {
    updateSourceStatus(source.id, source.status === 'active' ? 'paused' : 'active');
  };

  const openEditPrompts = (source: Source) => {
    setEditingSource(source);
    setEditPrompts({ filterPrompt: source.filterPrompt, formatPrompt: source.formatPrompt });
  };

  const savePrompts = () => {
    if (!editingSource) return;
    updateSourcePrompts(editingSource.id, {
      filterPrompt: editPrompts.filterPrompt,
      formatPrompt: editPrompts.formatPrompt,
    });
    setEditingSource(null);
  };

  const hasPromptsChanged =
    editingSource?.filterPrompt !== editPrompts.filterPrompt || editingSource?.formatPrompt !== editPrompts.formatPrompt;

  return (
    <div className="flex flex-col gap-6">
      <Card className="shadow-[0_30px_60px_-40px_rgba(78,115,248,0.25)] dark:shadow-slate-950/40">
        <CardHeader>
          <CardTitle>Добавить источник</CardTitle>
          <CardDescription>Настройте промты для фильтрации и форматирования</CardDescription>
        </CardHeader>
        <CardContent>
          <form className="grid gap-4 md:grid-cols-2" onSubmit={onSubmit}>
            <Select
              value={formState.type}
              onChange={(event) => setFormState((prev) => ({ ...prev, type: event.target.value as SourceType }))}
            >
              <option value="telegram">Telegram канал</option>
              <option value="website">Сайт / RSS</option>
            </Select>
            <Input
              required
              placeholder="Название"
              value={formState.title}
              onChange={(event) => setFormState((prev) => ({ ...prev, title: event.target.value }))}
            />
            <Input
              required
              placeholder={formState.type === 'telegram' ? '@username' : 'https://example.com'}
              value={formState.handle}
              onChange={(event) => setFormState((prev) => ({ ...prev, handle: event.target.value }))}
            />
            <div className="grid gap-4 md:col-span-2 md:grid-cols-2">
              <Textarea
                placeholder="Промт для фильтрации контента"
                value={formState.filterPrompt}
                onChange={(event) => setFormState((prev) => ({ ...prev, filterPrompt: event.target.value }))}
                className="min-h-[120px]"
              />
              <Textarea
                placeholder="Промт для форматирования контента"
                value={formState.formatPrompt}
                onChange={(event) => setFormState((prev) => ({ ...prev, formatPrompt: event.target.value }))}
                className="min-h-[120px]"
              />
            </div>
            <div className="md:col-span-2">
              <Button type="submit" className="mt-2 w-full md:w-auto">
                Подключить источник
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <section className="grid w-full gap-4 md:grid-cols-3">
        <Card className="bg-[radial-gradient(circle_at_top,_rgba(78,115,248,0.85),_rgba(118,159,255,0.65))] text-white shadow-[0_35px_60px_-30px_rgba(78,115,248,0.5)]">
          <CardHeader>
            <CardTitle>Всего источников</CardTitle>
            <CardDescription className="text-indigo-100/80">Суммарно активных и готовых к мониторингу</CardDescription>
          </CardHeader>
          <CardContent className="flex items-end justify-between">
            <span className="text-4xl font-semibold">{totals.total}</span>
            <span className="text-sm text-indigo-100/70">Активно: {totals.active}</span>
          </CardContent>
        </Card>
        <Card className="border-[rgb(var(--color-border))] bg-[rgb(var(--color-surface-elevated))] shadow-[0_28px_60px_-40px_rgba(78,115,248,0.35)]">
          <CardHeader>
            <CardTitle>Telegram</CardTitle>
            <CardDescription>Подключенные каналы и чаты</CardDescription>
          </CardHeader>
          <CardContent className="text-3xl font-semibold text-[rgb(var(--color-foreground))]">{totals.byType.telegram}</CardContent>
        </Card>
        <Card className="border-[rgb(var(--color-border))] bg-[rgb(var(--color-surface-elevated))] shadow-[0_28px_60px_-40px_rgba(78,115,248,0.35)]">
          <CardHeader>
            <CardTitle>Сайты</CardTitle>
            <CardDescription>RSS, парсеры и интеграции</CardDescription>
          </CardHeader>
          <CardContent className="text-3xl font-semibold text-[rgb(var(--color-foreground))]">{totals.byType.website}</CardContent>
        </Card>
      </section>

      <Card className="shadow-lg shadow-slate-200/25 dark:shadow-slate-950/40">
        <CardHeader>
          <div className="flex items-start justify-between gap-3">
            <div>
              <CardTitle>Список источников</CardTitle>
              <CardDescription>Управляйте подключенными каналами и настройками промтов</CardDescription>
            </div>
            <div className="hidden items-center gap-2 rounded-full border border-[rgb(var(--color-border))] px-3 py-1 text-xs text-muted md:flex">
              <IconFilter className="h-3.5 w-3.5" />
              {filteredSources.length} из {sources.length}
            </div>
          </div>
          <div className="grid gap-3 md:grid-cols-3">
            <Input
              placeholder="Поиск по названию или @..."
              value={filters.query}
              onChange={(event) => setFilters((prev) => ({ ...prev, query: event.target.value }))}
            />
            <Select value={filters.type} onChange={(event) => setFilters((prev) => ({ ...prev, type: event.target.value as Filters['type'] }))}>
              <option value="all">Все типы</option>
              <option value="telegram">Telegram</option>
              <option value="website">Сайты</option>
            </Select>
            <Select
              value={filters.status}
              onChange={(event) => setFilters((prev) => ({ ...prev, status: event.target.value as Filters['status'] }))}
            >
              <option value="all">Статус: любой</option>
              <option value="active">Только активные</option>
              <option value="paused">Приостановленные</option>
            </Select>
          </div>
        </CardHeader>
        <CardContent className="overflow-hidden rounded-xl border border-[rgb(var(--color-border))]">
          <div className="max-h-[420px] overflow-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Название</TableHead>
                  <TableHead>Тип</TableHead>
                  <TableHead>Промт фильтрации</TableHead>
                  <TableHead>Промт форматирования</TableHead>
                  <TableHead>Статус</TableHead>
                  <TableHead className="text-right">Действия</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredSources.map((source) => (
                  <TableRow key={source.id}>
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="font-medium text-foreground">{source.title}</span>
                        <span className="text-xs text-muted">{source.handle}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-sm text-muted">{source.type === 'telegram' ? 'Telegram' : 'Сайт'}</TableCell>
                    <TableCell className="max-w-xs">
                      <p className="line-clamp-3 text-xs text-muted">{source.filterPrompt || '—'}</p>
                    </TableCell>
                    <TableCell className="max-w-xs">
                      <p className="line-clamp-3 text-xs text-muted">{source.formatPrompt || '—'}</p>
                    </TableCell>
                    <TableCell>
                      <SourceStatusBadge status={source.status} />
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex flex-col items-end gap-2 sm:flex-row sm:justify-end">
                        <Button
                          variant={source.status === 'active' ? 'outline' : 'secondary'}
                          className="inline-flex items-center gap-2 border-[rgb(var(--color-border))] px-3 py-1 text-xs font-medium text-[rgb(var(--color-foreground))]"
                          onClick={() => handleStatusToggle(source)}
                        >
                          {source.status === 'active' ? <IconPause className="h-3.5 w-3.5" /> : <IconPlay className="h-3.5 w-3.5" />}
                          {source.status === 'active' ? 'Поставить на паузу' : 'Активировать'}
                        </Button>
                        <Button
                          variant="default"
                          className="inline-flex items-center gap-2 bg-[rgb(var(--color-primary))] px-3 py-1 text-xs font-medium text-[rgb(var(--color-primary-foreground))]"
                          onClick={() => openEditPrompts(source)}
                        >
                          <IconSettings className="h-3.5 w-3.5" />
                          Промты
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
                {filteredSources.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="py-8 text-center text-sm text-muted">
                      Источники по текущим фильтрам не найдены.
                    </TableCell>
                  </TableRow>
                ) : null}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {editingSource ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4">
          <Card className="w-full max-w-2xl">
            <CardHeader>
              <CardTitle>Настройка промтов</CardTitle>
              <CardDescription>
                {editingSource.title} ({editingSource.handle})
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              <Textarea
                value={editPrompts.filterPrompt}
                onChange={(event) => setEditPrompts((prev) => ({ ...prev, filterPrompt: event.target.value }))}
                placeholder="Опишите, какие сообщения допускать из источника"
                className="min-h-[140px]"
              />
              <Textarea
                value={editPrompts.formatPrompt}
                onChange={(event) => setEditPrompts((prev) => ({ ...prev, formatPrompt: event.target.value }))}
                placeholder="Опишите, как подготовить текст перед публикацией"
                className="min-h-[140px]"
              />
              <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
                <Button variant="ghost" onClick={() => setEditingSource(null)}>
                  Отмена
                </Button>
                <Button onClick={savePrompts} disabled={!hasPromptsChanged}>
                  Сохранить изменения
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      ) : null}
    </div>
  );
}

