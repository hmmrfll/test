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
	const { posts, sources, updatePost, moveToStatus, fetchPosts, fetchSources, isLoadingPosts } = useContentStore();
	const [filters, setFilters] = useState<Filters>({ query: '', status: 'all', sourceId: 'all' });
	const [selectedPostId, setSelectedPostId] = useState<string | null>(null);
	const [isSavingDraft, setIsSavingDraft] = useState(false);
	const [pendingAction, setPendingAction] = useState<'approve' | 'publish' | 'reject' | null>(null);
	const [isRefreshing, setIsRefreshing] = useState(false);

	const postsToReview = useMemo(() => posts.filter((post) => post.status !== 'published'), [posts]);

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

	const sortedPosts = useMemo(() => {
		return [...filteredPosts].sort((a, b) => {
			const aDate = Date.parse(a.updatedAt || a.createdAt);
			const bDate = Date.parse(b.updatedAt || b.createdAt);
			return bDate - aDate;
		});
	}, [filteredPosts]);

	const groupedPosts = useMemo(() => {
		const groups: Array<{ label: string; posts: Post[] }> = [];
		const map = new Map<string, { label: string; posts: Post[] }>();

		sortedPosts.forEach((post) => {
			const dateKey = getDateKey(post.updatedAt || post.createdAt);
			if (!map.has(dateKey)) {
				const group = { label: getDateLabel(dateKey), posts: [] as Post[] };
				map.set(dateKey, group);
				groups.push(group);
			}
			map.get(dateKey)!.posts.push(post);
		});

		return groups;
	}, [sortedPosts]);

	const selectedPost = useMemo<Post | null>(() => {
		if (!selectedPostId) return sortedPosts[0] ?? null;
		return sortedPosts.find((post) => post.id === selectedPostId) ?? sortedPosts[0] ?? null;
	}, [sortedPosts, selectedPostId]);

	const [editorState, setEditorState] = useState({
		title: '',
		content: '',
		tags: '',
	});

	useEffect(() => {
		fetchSources().catch(() => {});
		fetchPosts({ postStatus: 'all' }).catch(() => {});
	}, [fetchSources, fetchPosts]);

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

	const refreshData = async () => {
		setIsRefreshing(true);
		try {
			await Promise.all([fetchSources(), fetchPosts({ postStatus: 'all' })]);
		} finally {
			setIsRefreshing(false);
		}
	};

	const handleSave = async () => {
		if (!selectedPost) return;
		setIsSavingDraft(true);
		try {
			await updatePost(selectedPost.id, {
				title: editorState.title,
				content: editorState.content,
				tags: editorState.tags
					.split(',')
					.map((tag) => tag.trim())
					.filter(Boolean),
			});
		} finally {
			setIsSavingDraft(false);
		}
	};

	const handleApprove = async () => {
		if (!selectedPost) return;
		setPendingAction('approve');
		try {
			await moveToStatus(selectedPost.id, 'approved', {
				comment: 'Пост утвержден',
			});
		} finally {
			setPendingAction(null);
		}
	};

	const handlePublish = async () => {
		if (!selectedPost) return;
		setPendingAction('publish');
		try {
			await moveToStatus(selectedPost.id, 'published', {
				comment: 'Отправлено в канал',
			});
		} finally {
			setPendingAction(null);
		}
	};

	const handleReject = async () => {
		if (!selectedPost) return;
		setPendingAction('reject');
		try {
			await moveToStatus(selectedPost.id, 'rejected', {
				comment: 'Отклонено',
			});
		} finally {
			setPendingAction(null);
		}
	};

	return (
		<div className="grid gap-6 lg:grid-cols-[1.4fr_minmax(420px,1fr)]">
			<Card className="shadow-lg shadow-slate-200/30 dark:shadow-slate-950/40">
				<CardHeader className="gap-4">
					<div className="flex flex-col gap-2">
						<CardTitle>Очередь материалов</CardTitle>
						<CardDescription>Выбирайте посты для редакторской доработки и публикации</CardDescription>
					</div>
					<Button
						type="button"
						variant="outline"
						className="justify-self-start md:justify-self-end"
						onClick={refreshData}
						disabled={isRefreshing}
					>
						{isRefreshing ? 'Обновляем…' : 'Обновить'}
					</Button>
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
						<Select
							value={filters.status}
							onChange={(event) => setFilters((prev) => ({ ...prev, status: event.target.value as Filters['status'] }))}
						>
							{statusOptions.map((option) => (
								<option
									key={option.value}
									value={option.value}
								>
									{option.label}
								</option>
							))}
						</Select>
						<Select
							value={filters.sourceId}
							onChange={(event) =>
								setFilters((prev) => ({ ...prev, sourceId: event.target.value as Filters['sourceId'] }))
							}
						>
							<option value="all">Все источники</option>
							{sources.map((source) => (
								<option
									key={source.id}
									value={source.id}
								>
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
								{isLoadingPosts ? (
									<TableRow>
										<TableCell
											colSpan={4}
											className="py-10 text-center text-sm text-muted"
										>
											Загружаем ленту…
										</TableCell>
									</TableRow>
								) : (
									<>
										{groupedPosts.map((group) => (
											<>
												<TableRow
													key={`${group.label}-label`}
													className="bg-[rgb(var(--color-muted))]/60"
												>
													<TableCell
														colSpan={4}
														className="px-4 py-2 text-xs font-semibold uppercase tracking-wide text-muted"
													>
														{group.label}
													</TableCell>
												</TableRow>
												{group.posts.map((post) => {
													const source = sourceMap[post.sourceId];
													const isActive = selectedPost?.id === post.id;
													return (
														<TableRow
															key={post.id}
															onClick={() => setSelectedPostId(post.id)}
															className={cn(
																'cursor-pointer border-b border-[rgb(var(--color-border))] transition-colors',
																isActive
																	? 'bg-[rgba(var(--color-primary),0.08)] hover:bg-[rgba(var(--color-primary),0.12)] dark:bg-[rgba(var(--color-primary),0.15)] dark:hover:bg-[rgba(var(--color-primary),0.2)]'
																	: 'hover:bg-[rgba(var(--color-muted),0.35)]',
															)}
														>
															<TableCell>
																<div
																	className={cn(
																		'flex flex-col gap-1 border-l-4 pl-3',
																		isActive ? 'border-[rgb(var(--color-primary))]' : 'border-transparent',
																	)}
																>
																	<span className="font-medium text-foreground">{post.title}</span>
																	<div className="flex flex-wrap gap-1">
																		{post.tags.map((tag) => (
																			<span
																				key={tag}
																				className="rounded-full bg-[rgba(var(--color-muted),0.7)] px-2 py-0.5 text-[10px] uppercase tracking-wide text-muted"
																			>
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
											</>
										))}
										{groupedPosts.length === 0 ? (
											<TableRow>
												<TableCell
													colSpan={4}
													className="py-10 text-center text-sm text-muted"
												>
													Посты по указанным фильтрам не найдены.
												</TableCell>
											</TableRow>
										) : null}
									</>
								)}
							</TableBody>
						</Table>
					</div>
				</CardContent>
			</Card>

			<Card className="h-full lg:sticky lg:top-6">
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
								className="min-h-[220px]"
							/>
							<Input
								value={editorState.tags}
								onChange={(event) => setEditorState((prev) => ({ ...prev, tags: event.target.value }))}
								placeholder="Теги через запятую"
							/>
							<div className="flex flex-wrap items-center gap-3">
								<Button
									onClick={handleSave}
									variant="secondary"
									disabled={isSavingDraft}
								>
									{isSavingDraft ? 'Сохраняем…' : 'Сохранить правки'}
								</Button>
								<Button
									onClick={handleApprove}
									variant="outline"
									disabled={pendingAction === 'approve'}
								>
									{pendingAction === 'approve' ? 'Утверждаем…' : 'Утвердить'}
								</Button>
								<Button
									onClick={handleReject}
									variant="destructive"
									disabled={pendingAction === 'reject'}
								>
									{pendingAction === 'reject' ? 'Отклоняем…' : 'Отклонить'}
								</Button>
							</div>
							<div className="flex items-center gap-3 border-t border-[rgb(var(--color-border))] pt-4">
								<Button
									onClick={handlePublish}
									variant="default"
									className="w-full bg-[rgb(var(--color-primary))] text-[rgb(var(--color-primary-foreground))] hover:bg-[rgb(var(--color-primary))]/90"
									disabled={pendingAction === 'publish'}
								>
									{pendingAction === 'publish' ? 'Отправляем…' : 'Отправить пост'}
								</Button>
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

function getDateKey(dateString: string): string {
	const date = new Date(dateString);
	return date.toISOString().split('T')[0];
}

function getDateLabel(key: string): string {
	const today = new Date();
	const yesterday = new Date();
	yesterday.setDate(today.getDate() - 1);

	const todayKey = today.toISOString().split('T')[0];
	const yesterdayKey = yesterday.toISOString().split('T')[0];

	if (key === todayKey) return 'Сегодня';
	if (key === yesterdayKey) return 'Вчера';

	const date = new Date(key);
	return date.toLocaleDateString('ru-RU', {
		day: '2-digit',
		month: '2-digit',
		year: '2-digit',
	});
}
