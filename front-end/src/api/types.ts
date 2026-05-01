export type ApiUser = {
  id: string;
  name: string;
  email: string;
  createdAt: string;
};

export type ApiTag = { id: string; name: string };

export type ApiNote = {
  id: string;
  title: string;
  content: string;
  createdAt: string;
  updatedAt: string;
  tags: ApiTag[];
};

export type PaginatedNotes = {
  ok: true;
  items: ApiNote[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
};

export type ApiErrorBody = {
  ok: false;
  error: { message?: string; code?: string; issues?: unknown };
};
