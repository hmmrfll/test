export type SourceType = 'telegram' | 'website';

export type SourceStatus = 'active' | 'paused';

export interface Source {
  id: string;
  title: string;
  handle: string;
  type: SourceType;
  status: SourceStatus;
  createdAt: string;
  updatedAt?: string;
  ownerId?: string | null;
  filterPrompt: string;
  formatPrompt: string;
}

export type PostStatus = 'new' | 'editing' | 'approved' | 'rejected' | 'scheduled' | 'published';

export interface PostHistoryEvent {
  id: string;
  timestamp: string;
  author: string;
  action: 'created' | 'edited' | 'approved' | 'rejected' | 'published' | 'commented';
  comment?: string;
}

export interface Post {
  id: string;
  sourceId: string;
  sourceTitle?: string;
  sourceHandle?: string;
  title: string;
  content: string;
  originalContent: string;
  status: PostStatus;
  scheduledFor?: string;
  publishedAt?: string;
  tags: string[];
  history: PostHistoryEvent[];
  createdAt: string;
  updatedAt: string;
  author: string;
  editor?: string;
}

