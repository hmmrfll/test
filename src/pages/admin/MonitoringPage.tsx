import { useEffect, useMemo, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Input } from '../../components/ui/input';
import { Select } from '../../components/ui/select';
import { Button } from '../../components/ui/button';
import { Textarea } from '../../components/ui/textarea';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/table';
import { IconFilter, IconSearch } from '../../components/icons';
import { PostStatusBadge } from '../../components/status-badge';
import { useContentStore } from '../../store/content';
import { useAuthStore } from '../../store/auth';
import type { Post, PostStatus } from '../../types/content';
import { cn } from '../../lib/utils';

type Filters = {
  query: string;
  status: PostStatus | 'all';
  sourceId: string | 'all';
};

const statusOptions: Array<{ value: Filters['status']; label: string }> = [
  { value: 'all', label: 'Все статусы' },
  { value: 'new', label: 'Новые' },
  { value: 'editing', label: 'В работе' },
  { value: 'approved', label: 'Утвержденные' },
  { value: 'scheduled', label: 'Запланированные' },
  { value: 'rejected', label: 'Отклоненные' },
];

const formatDate = (value?: string) => {
  if (!value) return '—';
  return new Date(value).toLocaleString('ru-RU', {
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  });
};

export function MonitoringPage() {
  const { posts, sources, updatePost, appendHistory, moveToStatus } = useContentStore();
  const user = useAuthStore((state) => state.user);
  const [filters, setFilters] = useState<Filters>({ query: '', status: 'all', sourceId: 'all' });
  const [selectedPostId, setSelectedPostId] = useState<string | null>(null);
  const [comment, setComment] = useState('');

  const postsToReview = useMemo(
    () => posts.filter((post) => post.status !== 'published'),
    [posts],
  );

  const filteredPosts = useMemo(() => {
    return postsToReview.filter((post) => {
      const matchesQuery =
        filters.query.length === 0 ||
        post.title.toLowerCase().includes(filters.query.toLowerCase()) ||
        post.content.toLowerCase().includes(filters.query.toLowerCase());
      const matchesStatus = filters.status === 'all' || post.status === filters.status;
      const matchesSource = filters.sourceId === 'all' || post.sourceId === filters.sourceId;
      return matchesQuery && matchesStatus && matchesSource;
    });
  }, [filters, postsToReview]);

  const selectedPost = useMemo<Post | null>(() => {
    if (!selectedPostId) return filteredPosts[0] ?? null;
    return filteredPosts.find((post) => post.id === selectedPostId) ?? filteredPosts[0] ?? null;
  }, [filteredPosts, selectedPostId]);

  const [editorState, setEditorState] = useState({
    title: '',
    content: '',
    tags: '',
  });

  useEffect(() => {
    if (selectedPost) {
      setSelectedPostId(selectedPost.id);
      setEditorState({
        title: selectedPost.title,
        content: selectedPost.content,
        tags: selectedPost.tags.join(', '),
      });
    }
  }, [selectedPost?.id]);

  const sourceMap = useMemo(() => Object.fromEntries(sources.map((source) => [source.id, source])), [sources]);

  const handleSave = () => {
    if (!selectedPost) return;
    updatePost(selectedPost.id, {
      title: editorState.title,
      content: editorState.content,
      tags: editorState.tags
        .split(',')
        .map((tag) => tag.trim())
        .filter(Boolean),
      editor: user?.name ?? 'Редактор',
      status: selectedPost.status === 'new' ? 'editing' : selectedPost.status,
    });
    appendHistory(selectedPost.id, {
      author: user?.name ?? 'Редактор',
      action: 'edited',
      comment: 'Обновлено содержание поста',
    });
  };

  const handleApprove = () => {
    if (!selectedPost) return;
    moveToStatus(selectedPost.id, 'approved', {
      author: user?.name ?? 'Редактор',
      comment: comment || 'Пост утвержден',
    });
    setComment('');
  };

  const handlePublish = () => {
    if (!selectedPost) return;
    moveToStatus(selectedPost.id, 'published', {
      author: user?.name ?? 'Редактор',
      comment: comment || 'Отправлено в канал',
    });
    setComment('');
  };

  const handleReject = () => {
    if (!selectedPost) return;
    moveToStatus(selectedPost.id, 'rejected', {
      author: user?.name ?? 'Редактор',
      comment: comment || 'Отклонено',
    });
    setComment('');
  };

  return (
    <div className="grid gap-6 lg:grid-cols-[1.2fr_1fr]">
      <Card className="shadow-lg shadow-slate-200/30 dark:shadow-slate-950/40">
        <CardHeader className="gap-4">
          <div className="flex flex-col gap-2">
            <CardTitle>Очередь материалов</CardTitle>
            <CardDescription>Выбирайте посты для редакторской доработки и публикации</CardDescription>
          </div>
          <div className="grid gap-3 md:grid-cols-3">
            <div className="relative">
              <IconSearch className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
              <Input
                className="pl-9"
                placeholder="Поиск по тексту или тегам"
                value={filters.query}
                onChange={(event) => setFilters((prev) => ({ ...prev, query: event.target.value }))}
              />
            </div>
            <Select value={filters.status} onChange={(event) => setFilters((prev) => ({ ...prev, status: event.target.value as Filters['status'] }))}>
              {statusOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </Select>
            <Select value={filters.sourceId} onChange={(event) => setFilters((prev) => ({ ...prev, sourceId: event.target.value as Filters['sourceId'] }))}>
              <option value="all">Все источники</option>
              {sources.map((source) => (
                <option key={source.id} value={source.id}>
                  {source.title}
                </option>
              ))}
            </Select>
          </div>
        </CardHeader>
        <CardContent className="overflow-hidden">
          <div className="flex items-center justify-between rounded-xl border border-[rgb(var(--color-border))] bg-[rgb(var(--color-muted))] px-4 py-2 text-xs text-muted">
            <span>
              Найдено материалов: <strong className="font-semibold text-foreground">{filteredPosts.length}</strong>
            </span>
            <span className="hidden items-center gap-2 md:flex">
              <IconFilter className="h-3.5 w-3.5" />
              Фильтры активны
            </span>
          </div>
          <div className="mt-4 max-h-[520px] overflow-auto rounded-xl border border-[rgb(var(--color-border))]">
            <Table className="min-w-full">
              <TableHeader>
                <TableRow>
                  <TableHead>Заголовок</TableHead>
                  <TableHead>Источник</TableHead>
                  <TableHead>Статус</TableHead>
                  <TableHead>Обновлено</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredPosts.map((post) => {
                  const source = sourceMap[post.sourceId];
                  const isActive = selectedPost?.id === post.id;
                  return (
                    <TableRow
                      key={post.id}
                      onClick={() => setSelectedPostId(post.id)}
                      className={cn(
                        'cursor-pointer border-b border-[rgb(var(--color-border))]',
                        isActive
                          ? 'bg-[rgba(var(--color-primary),0.12)] hover:bg-[rgba(var(--color-primary),0.16)] dark:bg-[rgba(var(--color-primary),0.18)] dark:hover:bg-[rgba(var(--color-primary),0.25)]'
                          : 'hover:bg-[rgba(var(--color-muted),0.35)]',
                      )}
                    >
                      <TableCell>
                        <div className="flex flex-col gap-1">
                          <span className="font-medium text-foreground">{post.title}</span>
                          <div className="flex flex-wrap gap-1">
                            {post.tags.map((tag) => (
                              <span key={tag} className="rounded-full bg-[rgba(var(--color-muted),0.7)] px-2 py-0.5 text-[10px] uppercase tracking-wide text-muted">
                                #{tag}
                              </span>
                            ))}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-sm text-muted">{source?.title ?? 'Неизвестно'}</TableCell>
                      <TableCell>
                        <PostStatusBadge status={post.status} />
                      </TableCell>
                      <TableCell className="text-sm text-muted">{formatDate(post.updatedAt)}</TableCell>
                    </TableRow>
                  );
                })}
                {filteredPosts.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="py-10 text-center text-sm text-muted">
                      Посты по указанным фильтрам не найдены.
                    </TableCell>
                  </TableRow>
                ) : null}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <Card className="h-full">
        {selectedPost ? (
          <>
            <CardHeader className="gap-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <CardTitle>{selectedPost.title}</CardTitle>
                  <CardDescription>Редактируйте текст, управляйте статусом и просматривайте историю</CardDescription>
                </div>
                <div className="rounded-full border border-[rgb(var(--color-border))] bg-[rgb(var(--color-muted))] px-3 py-1 text-xs text-muted">
                  {sourceMap[selectedPost.sourceId]?.title ?? 'Источник не найден'}
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                <PostStatusBadge status={selectedPost.status} />
                <span className="text-xs text-muted">Создано: {formatDate(selectedPost.createdAt)}</span>
              </div>
            </CardHeader>
            <CardContent className="flex flex-1 flex-col gap-4">
              <Input
                value={editorState.title}
                onChange={(event) => setEditorState((prev) => ({ ...prev, title: event.target.value }))}
              />
              <Textarea
                value={editorState.content}
                onChange={(event) => setEditorState((prev) => ({ ...prev, content: event.target.value }))}
              />
              <Input
                value={editorState.tags}
                onChange={(event) => setEditorState((prev) => ({ ...prev, tags: event.target.value }))}
                placeholder="Теги через запятую"
              />
              <div className="flex flex-col gap-2">
                <label className="text-xs font-medium text-muted">Комментарий к действию</label>
                <Textarea
                  className="min-h-[80px]"
                  value={comment}
                  onChange={(event) => setComment(event.target.value)}
                  placeholder="Опционально: добавьте бриф по публикации или причину отклонения"
                />
              </div>
              <div className="flex flex-wrap items-center gap-3">
                <Button onClick={handleSave} variant="secondary">
                  Сохранить правки
                </Button>
                <Button onClick={handleApprove} variant="outline">
                  Утвердить
                </Button>
                <Button onClick={handlePublish}>Отправить</Button>
                <Button onClick={handleReject} variant="destructive">
                  Отклонить
                </Button>
              </div>
              <div className="mt-4">
                <h4 className="text-sm font-semibold text-foreground">История действий</h4>
                <ul className="mt-3 flex flex-col gap-3">
                  {selectedPost.history.map((event) => (
                    <li key={event.id} className="rounded-xl border border-[rgb(var(--color-border))] bg-[rgb(var(--color-muted))] px-3 py-2">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-medium text-foreground">{event.author}</span>
                        <span className="text-muted">{formatDate(event.timestamp)}</span>
                      </div>
                      <p className="mt-1 text-xs text-muted">
                        {translateAction(event.action)}
                        {event.comment ? ` · ${event.comment}` : ''}
                      </p>
                    </li>
                  ))}
                </ul>
              </div>
            </CardContent>
          </>
        ) : (
          <div className="flex h-full flex-col items-center justify-center gap-2 px-8 py-16 text-center text-muted">
            <p className="text-sm font-medium text-foreground">Нет выбранного поста</p>
            <p className="text-sm text-muted">Выберите материал слева, чтобы открыть детальную карточку.</p>
          </div>
        )}
      </Card>
    </div>
  );
}

function translateAction(action: Post['history'][number]['action']) {
  switch (action) {
    case 'created':
      return 'Пост импортирован';
    case 'edited':
      return 'Текст обновлен';
    case 'approved':
      return 'Материал утвержден';
    case 'rejected':
      return 'Материал отклонен';
    case 'published':
      return 'Материал отправлен';
    case 'commented':
      return 'Добавлен комментарий';
    default:
      return action;
  }
}

