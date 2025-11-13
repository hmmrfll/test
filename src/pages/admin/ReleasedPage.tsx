import { useMemo, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Input } from '../../components/ui/input';
import { Select } from '../../components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/table';
import { PostStatusBadge } from '../../components/status-badge';
import { useContentStore } from '../../store/content';

type Filters = {
  query: string;
  sourceId: string | 'all';
  timeframe: 'all' | '7d' | '30d' | '90d';
};

const formatDateTime = (value?: string) =>
  value
    ? new Date(value).toLocaleString('ru-RU', {
        day: 'numeric',
        month: 'short',
        hour: '2-digit',
        minute: '2-digit',
      })
    : '—';

const timeframes: Record<Filters['timeframe'], number> = {
  all: Infinity,
  '7d': 7,
  '30d': 30,
  '90d': 90,
};

export function ReleasedPage() {
  const { posts, sources } = useContentStore();
  const [filters, setFilters] = useState<Filters>({ query: '', sourceId: 'all', timeframe: '30d' });

  const publishedPosts = useMemo(() => posts.filter((post) => post.status === 'published'), [posts]);

  const filteredPosts = useMemo(() => {
    const now = Date.now();
    return publishedPosts.filter((post) => {
      const matchesQuery =
        filters.query.length === 0 ||
        post.title.toLowerCase().includes(filters.query.toLowerCase()) ||
        post.content.toLowerCase().includes(filters.query.toLowerCase());
      const matchesSource = filters.sourceId === 'all' || post.sourceId === filters.sourceId;
      const matchesTimeframe =
        filters.timeframe === 'all' ||
        (post.publishedAt ? now - new Date(post.publishedAt).getTime() <= timeframes[filters.timeframe] * 24 * 60 * 60 * 1000 : false);
      return matchesQuery && matchesSource && matchesTimeframe;
    });
  }, [filters, publishedPosts]);

  const sourceMap = useMemo(() => Object.fromEntries(sources.map((source) => [source.id, source])), [sources]);

  const totals = useMemo(() => {
    const bySource = filteredPosts.reduce<Record<string, number>>((acc, post) => {
      acc[post.sourceId] = (acc[post.sourceId] ?? 0) + 1;
      return acc;
    }, {});
    return { total: filteredPosts.length, bySource };
  }, [filteredPosts]);

  return (
    <div className="flex flex-col gap-6">
      <section className="grid gap-4 md:grid-cols-3">
        <Card className="bg-gradient-to-br from-indigo-600 via-indigo-500 to-indigo-400 text-white shadow-xl shadow-indigo-500/30">
          <CardHeader>
            <CardTitle>Опубликовано</CardTitle>
            <CardDescription className="text-indigo-100">Всего материалов, отправленных в каналы</CardDescription>
          </CardHeader>
          <CardContent className="text-4xl font-semibold">{publishedPosts.length}</CardContent>
        </Card>
        <Card className="shadow-lg shadow-slate-200/25 dark:shadow-slate-950/40">
          <CardHeader>
            <CardTitle>Срез периода</CardTitle>
            <CardDescription>Отобрано по текущим фильтрам</CardDescription>
          </CardHeader>
          <CardContent className="flex items-baseline gap-2 text-3xl font-semibold">
            {totals.total}
            <span className="text-xs font-normal text-muted">материалов</span>
          </CardContent>
        </Card>
        <Card className="shadow-lg shadow-slate-200/25 dark:shadow-slate-950/40">
          <CardHeader>
            <CardTitle>Топ источников</CardTitle>
            <CardDescription>Лидеры по количеству публикаций</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-2 text-sm">
            {Object.entries(totals.bySource)
              .sort((a, b) => b[1] - a[1])
              .slice(0, 2)
              .map(([sourceId, count]) => (
                <div key={sourceId} className="flex items-center justify-between">
                  <span className="truncate text-muted">{sourceMap[sourceId]?.title ?? sourceId}</span>
                  <span className="rounded-full border border-[rgb(var(--color-border))] px-2 py-0.5 text-xs text-muted">{count}</span>
                </div>
              ))}
            {Object.keys(totals.bySource).length === 0 ? <span className="text-muted">По фильтрам нет данных</span> : null}
          </CardContent>
        </Card>
      </section>

      <Card className="shadow-lg shadow-slate-200/30 dark:shadow-slate-950/40">
        <CardHeader>
          <CardTitle>История публикаций</CardTitle>
          <CardDescription>Аналитика и быстрый доступ к опубликованным постам</CardDescription>
          <div className="grid gap-3 md:grid-cols-3">
            <Input
              placeholder="Поиск по тексту"
              value={filters.query}
              onChange={(event) => setFilters((prev) => ({ ...prev, query: event.target.value }))}
            />
            <Select value={filters.sourceId} onChange={(event) => setFilters((prev) => ({ ...prev, sourceId: event.target.value as Filters['sourceId'] }))}>
              <option value="all">Все источники</option>
              {sources.map((source) => (
                <option key={source.id} value={source.id}>
                  {source.title}
                </option>
              ))}
            </Select>
            <Select
              value={filters.timeframe}
              onChange={(event) => setFilters((prev) => ({ ...prev, timeframe: event.target.value as Filters['timeframe'] }))}
            >
              <option value="7d">Последние 7 дней</option>
              <option value="30d">30 дней</option>
              <option value="90d">90 дней</option>
              <option value="all">За все время</option>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          <div className="max-h-[540px] overflow-auto rounded-xl border border-[rgb(var(--color-border))]">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Заголовок</TableHead>
                  <TableHead>Источник</TableHead>
                  <TableHead>Опубликовано</TableHead>
                  <TableHead>Автор</TableHead>
                  <TableHead>Статус</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredPosts.map((post) => {
                  const source = sourceMap[post.sourceId];
                  return (
                    <TableRow key={post.id} className="border-b border-[rgb(var(--color-border))] hover:bg-[rgba(var(--color-muted),0.35)]">
                      <TableCell>
                        <div className="flex flex-col">
                          <span className="font-medium text-foreground">{post.title}</span>
                          <p className="line-clamp-2 text-xs text-muted">{post.content}</p>
                        </div>
                      </TableCell>
                      <TableCell className="text-sm text-muted">{source?.title ?? '—'}</TableCell>
                      <TableCell className="text-sm text-muted">{formatDateTime(post.publishedAt)}</TableCell>
                      <TableCell className="text-sm text-muted">{post.author}</TableCell>
                      <TableCell>
                        <PostStatusBadge status={post.status} />
                      </TableCell>
                    </TableRow>
                  );
                })}
                {filteredPosts.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="py-10 text-center text-sm text-muted">
                      По выбранным фильтрам публикаций нет.
                    </TableCell>
                  </TableRow>
                ) : null}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

