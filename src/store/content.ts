import { create } from 'zustand';
import type { Post, PostStatus, Source, SourceStatus, SourceType } from '../types/content';
import { apiRequest } from '../lib/api';
import { useAuthStore } from './auth';

type FilterState = {
	query: string;
	type: SourceType | 'all';
	status: SourceStatus | 'all';
	postStatus: PostStatus | 'all';
	sourceId: string | 'all';
};

export interface ContentSettings {
	autoPublishEnabled: boolean;
	defaultLanguage: 'ru' | 'en';
	parserEnabled: boolean;
}

type ApiHistoryEntry = {
	id: string;
	action: string;
	comment?: string | null;
	actorName?: string | null;
	createdAt: string;
};

type ApiPost = {
	id: string;
	sourceId: string;
	sourceTitle: string;
	sourceHandle: string;
	title: string;
	content: string;
	originalContent: string | null;
	status: PostStatus;
	tags?: string[];
	scheduledFor?: string | null;
	publishedAt?: string | null;
	authorId?: string | null;
	editorId?: string | null;
	createdAt: string;
	updatedAt: string;
	history: ApiHistoryEntry[];
};

const mapPost = (payload: ApiPost): Post => ({
	id: payload.id,
	sourceId: payload.sourceId,
	sourceTitle: payload.sourceTitle,
	sourceHandle: payload.sourceHandle,
	title: payload.title,
	content: payload.content,
	originalContent: payload.originalContent ?? '',
	status: payload.status,
	tags: payload.tags ?? [],
	scheduledFor: payload.scheduledFor ?? undefined,
	publishedAt: payload.publishedAt ?? undefined,
	history: payload.history.map((entry) => ({
		id: entry.id,
		timestamp: entry.createdAt,
		author: entry.actorName ?? 'Система',
		action: (entry.action as Post['history'][number]['action']) ?? 'commented',
		comment: entry.comment ?? undefined,
	})),
	createdAt: payload.createdAt,
	updatedAt: payload.updatedAt,
	author: payload.sourceTitle,
	editor: undefined,
});

interface ContentState {
	sources: Source[];
	posts: Post[];
	filters: FilterState;
	settings: ContentSettings;
	isLoadingSources: boolean;
	isLoadingPosts: boolean;
	fetchSources: () => Promise<void>;
	addSource: (payload: { title: string; handle: string; type: SourceType; filterPrompt: string; formatPrompt: string }) => Promise<void>;
	updateSourceStatus: (id: string, status: SourceStatus) => Promise<void>;
	updateSourcePrompts: (id: string, prompts: Pick<Source, 'filterPrompt' | 'formatPrompt'>) => Promise<void>;
	fetchPosts: (filters?: Partial<Pick<FilterState, 'postStatus' | 'query' | 'sourceId'>>) => Promise<void>;
	updatePost: (id: string, data: { title: string; content: string; tags: string[] }) => Promise<void>;
	moveToStatus: (postId: string, status: PostStatus, meta?: { comment?: string }) => Promise<void>;
	updateFilters: (filters: Partial<FilterState>) => void;
	updateSettings: (settings: Partial<ContentSettings>) => void;
}

const ensureToken = (): string => {
	const token = useAuthStore.getState().token;
	if (!token) {
		throw new Error('Требуется авторизация');
	}
	return token;
};

export const useContentStore = create<ContentState>((set, get) => ({
	sources: [],
	posts: [],
	filters: {
		query: '',
		type: 'all',
		status: 'all',
		postStatus: 'all',
		sourceId: 'all',
	},
	settings: {
		autoPublishEnabled: false,
		defaultLanguage: 'ru',
		parserEnabled: true,
	},
	isLoadingSources: false,
	isLoadingPosts: false,
	async fetchSources() {
		const token = ensureToken();
		set({ isLoadingSources: true });
		try {
			const response = await apiRequest<{ sources: Source[] }>('/sources', { token });
			set({ sources: response.sources, isLoadingSources: false });
		} catch (error) {
			set({ isLoadingSources: false });
			throw error;
		}
	},
	async addSource(payload) {
		const token = ensureToken();
		const response = await apiRequest<{ source: Source }>('/sources', {
			method: 'POST',
			body: payload,
			token,
		});
		set((state) => ({
			sources: [response.source, ...state.sources],
		}));
	},
	async updateSourceStatus(id, status) {
		const token = ensureToken();
		const response = await apiRequest<{ source: Source }>(`/sources/${id}`, {
			method: 'PUT',
			body: { status },
			token,
		});
		set((state) => ({
			sources: state.sources.map((source) => (source.id === id ? response.source : source)),
		}));
	},
	async updateSourcePrompts(id, prompts) {
		const token = ensureToken();
		const response = await apiRequest<{ source: Source }>(`/sources/${id}`, {
			method: 'PUT',
			body: prompts,
			token,
		});
		set((state) => ({
			sources: state.sources.map((source) => (source.id === id ? response.source : source)),
		}));
	},
	async fetchPosts(filters) {
		const token = ensureToken();
		const mergedFilters = {
			...get().filters,
			...filters,
		};
		set({ isLoadingPosts: true, filters: mergedFilters });
		try {
			const response = await apiRequest<{ posts: ApiPost[] }>('/posts', {
				token,
				params: {
					status: mergedFilters.postStatus === 'all' ? undefined : mergedFilters.postStatus,
					sourceId: mergedFilters.sourceId === 'all' ? undefined : mergedFilters.sourceId,
					q: mergedFilters.query || undefined,
				},
			});
			set({
				posts: response.posts.map(mapPost),
				isLoadingPosts: false,
			});
		} catch (error) {
			set({ isLoadingPosts: false });
			throw error;
		}
	},
	async updatePost(id, data) {
		const token = ensureToken();
		const response = await apiRequest<{ post: ApiPost }>(`/posts/${id}`, {
			method: 'PUT',
			body: data,
			token,
		});
		const mapped = mapPost(response.post);
		set((state) => ({
			posts: state.posts.map((post) => (post.id === id ? mapped : post)),
		}));
	},
	async moveToStatus(postId, status, meta) {
		const token = ensureToken();
		const response = await apiRequest<{ post: ApiPost }>(`/posts/${postId}/status`, {
			method: 'POST',
			body: {
				status,
				comment: meta?.comment,
			},
			token,
		});
		const mapped = mapPost(response.post);
		set((state) => ({
			posts: state.posts.map((post) => (post.id === postId ? mapped : post)),
		}));
	},
	updateFilters(filters) {
		set((state) => ({
			filters: {
				...state.filters,
				...filters,
			},
		}));
	},
	updateSettings(settings) {
		set((state) => ({
			settings: {
				...state.settings,
				...settings,
			},
		}));
	},
}));
