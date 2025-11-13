import { create } from 'zustand';
import type { Post, PostHistoryEvent, PostStatus, Source, SourceStatus, SourceType } from '../types/content';

type FilterState = {
  query: string;
  type: SourceType | 'all';
  status: SourceStatus | 'all';
  postStatus: PostStatus | 'all';
};

export interface ContentSettings {
  autoPublishEnabled: boolean;
  defaultLanguage: 'ru' | 'en';
  parserEnabled: boolean;
}

interface ContentState {
  sources: Source[];
  posts: Post[];
  filters: FilterState;
  settings: ContentSettings;
  addSource: (payload: Omit<Source, 'id' | 'createdAt'>) => void;
  updateSourceStatus: (id: string, status: SourceStatus) => void;
  updateSourcePrompts: (id: string, prompts: Pick<Source, 'filterPrompt' | 'formatPrompt'>) => void;
  addPost: (payload: Omit<Post, 'id' | 'createdAt' | 'updatedAt' | 'history'>) => void;
  updatePost: (id: string, data: Partial<Post>) => void;
  appendHistory: (postId: string, event: Omit<PostHistoryEvent, 'id' | 'timestamp'>) => void;
  moveToStatus: (postId: string, status: PostStatus, meta?: { comment?: string; author: string }) => void;
  updateFilters: (filters: Partial<FilterState>) => void;
  updateSettings: (settings: Partial<ContentSettings>) => void;
}

const now = () => new Date().toISOString();

const seedSources: Source[] = [
  {
    id: 'tg-kr-life',
    title: 'KR Life Новости',
    handle: '@kr_life_news',
    type: 'telegram',
    status: 'active',
    createdAt: now(),
    filterPrompt: 'Пропускай только материалы про KR Life, аналитику и ключевые события региона.',
    formatPrompt: 'Выдели заголовок, краткий лид и три ключевых тезиса списком.',
  },
  {
    id: 'tg-tech',
    title: 'Tech Digest',
    handle: '@tech_digest',
    type: 'telegram',
    status: 'active',
    createdAt: now(),
    filterPrompt: 'Отбирай новости об AI, стартапах и инвестициях в технологии.',
    formatPrompt: 'Сформируй короткий дайджест с emoji и ссылками в конце.',
  },
  {
    id: 'site-analytics',
    title: 'KR Analytics',
    handle: 'https://analytics.kr-life.ru',
    type: 'website',
    status: 'paused',
    createdAt: now(),
    filterPrompt: 'Парсить только аналитические статьи о финансах и экономике региона.',
    formatPrompt: 'Оставь аналитический стиль, добавь блок с ключевыми метриками.',
  },
];

const seedPosts: Post[] = [
  {
    id: 'post-1',
    sourceId: 'tg-kr-life',
    title: 'Ключевые тренды недели',
    content: 'Актуализировали ключевые тренды недели для KR Life. Проверьте акценты перед публикацией.',
    originalContent: 'Ключевые тренды недели в оригинале...',
    status: 'new',
    tags: ['тренды', 'обзор'],
    history: [
      {
        id: crypto.randomUUID(),
        timestamp: now(),
        author: 'Система',
        action: 'created',
        comment: 'Пост получен из канала @kr_life_news',
      },
    ],
    createdAt: now(),
    updatedAt: now(),
    author: 'Система',
  },
  {
    id: 'post-2',
    sourceId: 'tg-tech',
    title: 'AI-обновления',
    content: 'Собрали апдейты по AI-индустрии. Добавьте CTA и проверку ссылок.',
    originalContent: 'Оригинальный текст про AI...',
    status: 'editing',
    tags: ['ai'],
    history: [
      {
        id: crypto.randomUUID(),
        timestamp: now(),
        author: 'Система',
        action: 'created',
        comment: 'Импортировано из @tech_digest',
      },
      {
        id: crypto.randomUUID(),
        timestamp: now(),
        author: 'Мария',
        action: 'edited',
        comment: 'Добавлены актуальные цифры роста рынка.',
      },
    ],
    createdAt: now(),
    updatedAt: now(),
    author: 'Система',
    editor: 'Мария',
  },
  {
    id: 'post-3',
    sourceId: 'site-analytics',
    title: 'Итоги квартала',
    content: 'Готов к публикации. Проверьте оформление ссылок.',
    originalContent: 'Итоги квартала в оригинале...',
    status: 'published',
    tags: ['финансы'],
    history: [
      {
        id: crypto.randomUUID(),
        timestamp: now(),
        author: 'Система',
        action: 'created',
        comment: 'Загружено с сайта analytics.kr-life.ru',
      },
      {
        id: crypto.randomUUID(),
        timestamp: now(),
        author: 'Иван',
        action: 'approved',
        comment: 'Готово к публикации',
      },
      {
        id: crypto.randomUUID(),
        timestamp: now(),
        author: 'Иван',
        action: 'published',
        comment: 'Отправлено в Telegram',
      },
    ],
    createdAt: now(),
    updatedAt: now(),
    author: 'Иван',
    publishedAt: now(),
  },
];

export const useContentStore = create<ContentState>((set) => ({
  sources: seedSources,
  posts: seedPosts,
  filters: {
    query: '',
    type: 'all',
    status: 'all',
    postStatus: 'all',
  },
  settings: {
    autoPublishEnabled: false,
    defaultLanguage: 'ru',
    parserEnabled: true,
  },
  addSource(payload) {
    set((state) => ({
      sources: [
        {
          ...payload,
          id: crypto.randomUUID(),
          createdAt: now(),
        },
        ...state.sources,
      ],
    }));
  },
  updateSourceStatus(id, status) {
    set((state) => ({
      sources: state.sources.map((source) => (source.id === id ? { ...source, status } : source)),
    }));
  },
  updateSourcePrompts(id, prompts) {
    set((state) => ({
      sources: state.sources.map((source) => (source.id === id ? { ...source, ...prompts } : source)),
    }));
  },
  addPost(payload) {
    const createdAt = now();
    const history: PostHistoryEvent[] = [
      {
        id: crypto.randomUUID(),
        timestamp: createdAt,
        author: payload.author,
        action: 'created',
        comment: 'Пост добавлен вручную',
      },
    ];

    set((state) => ({
      posts: [
        {
          ...payload,
          id: crypto.randomUUID(),
          createdAt,
          updatedAt: createdAt,
          history,
        },
        ...state.posts,
      ],
    }));
  },
  updatePost(id, data) {
    set((state) => ({
      posts: state.posts.map((post) =>
        post.id === id
          ? {
              ...post,
              ...data,
              updatedAt: now(),
            }
          : post,
      ),
    }));
  },
  appendHistory(postId, event) {
    set((state) => ({
      posts: state.posts.map((post) =>
        post.id === postId
          ? {
              ...post,
              history: [{ ...event, id: crypto.randomUUID(), timestamp: now() }, ...post.history],
              updatedAt: now(),
            }
          : post,
      ),
    }));
  },
  moveToStatus(postId, status, meta) {
    set((state) => ({
      posts: state.posts.map((post) => {
        if (post.id !== postId) return post;

        const timestamp = now();
        const historyEntry: PostHistoryEvent = {
          id: crypto.randomUUID(),
          timestamp,
          author: meta?.author ?? 'Система',
          action: status === 'rejected' ? 'rejected' : status === 'published' ? 'published' : 'approved',
          comment: meta?.comment,
        };

        return {
          ...post,
          status,
          updatedAt: timestamp,
          publishedAt: status === 'published' ? timestamp : post.publishedAt,
          history: [historyEntry, ...post.history],
        };
      }),
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

