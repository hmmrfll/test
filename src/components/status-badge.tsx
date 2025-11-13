import * as React from 'react';
import { Badge } from './ui/badge';
import type { PostStatus, SourceStatus } from '../types/content';

export function SourceStatusBadge({ status }: { status: SourceStatus }) {
  if (status === 'active') {
    return <Badge variant="success">Активен</Badge>;
  }
  return <Badge variant="warning">Приостановлен</Badge>;
}

const postStatusMap: Record<PostStatus, { label: string; variant: React.ComponentProps<typeof Badge>['variant'] }> = {
  new: { label: 'Новый', variant: 'secondary' },
  editing: { label: 'В работе', variant: 'warning' },
  approved: { label: 'Утвержден', variant: 'success' },
  rejected: { label: 'Отклонен', variant: 'destructive' },
  scheduled: { label: 'Запланирован', variant: 'outline' },
  published: { label: 'Опубликован', variant: 'default' },
};

export function PostStatusBadge({ status }: { status: PostStatus }) {
  const { label, variant } = postStatusMap[status];
  return <Badge variant={variant}>{label}</Badge>;
}

