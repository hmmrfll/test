import { create } from 'zustand';
import { apiRequest } from '../lib/api';

export interface User {
	id: string;
	email: string;
	name: string;
	role: 'owner' | 'admin' | 'editor';
}

interface AuthState {
	user: User | null;
	token: string | null;
	isLoading: boolean;
	error: string | null;
	members: User[];
	initialize: () => Promise<void>;
	login: (payload: { email: string; password: string }) => Promise<void>;
	register: (payload: { email: string; password: string; name: string }) => Promise<void>;
	updateProfile: (payload: { name: string }) => Promise<void>;
	updateUserRole: (userId: string, role: User['role']) => Promise<void>;
	fetchMembers: () => Promise<void>;
	logout: () => void;
	clearError: () => void;
}

const ACCESS_TOKEN_KEY = 'kr-life-token';

const persistToken = (token: string | null) => {
	if (token) {
		window.localStorage.setItem(ACCESS_TOKEN_KEY, token);
	} else {
		window.localStorage.removeItem(ACCESS_TOKEN_KEY);
	}
};

export const useAuthStore = create<AuthState>((set, get) => ({
	user: null,
	token: null,
	isLoading: false,
	error: null,
	members: [],
	async initialize() {
		const storedToken = window.localStorage.getItem(ACCESS_TOKEN_KEY);
		if (!storedToken) return;

		set({ isLoading: true });
		try {
			const response = await apiRequest<{ user: User }>('/auth/me', { token: storedToken });
			set({ user: response.user, token: storedToken, isLoading: false });
		} catch {
			persistToken(null);
			set({ user: null, token: null, isLoading: false });
		}
	},
	async login(payload) {
		set({ isLoading: true, error: null });
		try {
			const response = await apiRequest<{ user: User; token: string }>('/auth/login', {
				method: 'POST',
				body: payload,
			});
			persistToken(response.token);
			set({ user: response.user, token: response.token, isLoading: false });
		} catch (error) {
			set({ error: (error as Error).message, isLoading: false });
			throw error;
		}
	},
	async register(payload) {
		set({ isLoading: true, error: null });
		try {
			const response = await apiRequest<{ user: User; token: string }>('/auth/register', {
				method: 'POST',
				body: payload,
			});
			persistToken(response.token);
			set({ user: response.user, token: response.token, isLoading: false });
		} catch (error) {
			set({ error: (error as Error).message, isLoading: false });
			throw error;
		}
	},
	async updateProfile({ name }) {
		const { token, user } = get();
		if (!token || !user) return;

		try {
			const response = await apiRequest<{ user: User }>(`/users/${user.id}`, {
				method: 'PUT',
				body: { name },
				token,
			});
			set((state) => ({
				user: response.user,
				members: state.members.map((member) => (member.id === response.user.id ? response.user : member)),
			}));
		} catch (error) {
			set({ error: (error as Error).message });
			throw error;
		}
	},
	async updateUserRole(userId, role) {
		const token = get().token;
		if (!token) return;

		try {
			const response = await apiRequest<{ user: User }>(`/users/${userId}`, {
				method: 'PUT',
				body: { role },
				token,
			});
			set((state) => ({
				members: state.members.map((member) => (member.id === userId ? response.user : member)),
				user: state.user && state.user.id === userId ? response.user : state.user,
			}));
		} catch (error) {
			set({ error: (error as Error).message });
			throw error;
		}
	},
	async fetchMembers() {
		const token = get().token;
		if (!token) return;
		try {
			const response = await apiRequest<{ data: User[] }>('/users', { token });
			set({ members: response.data });
		} catch (error) {
			set({ error: (error as Error).message });
		}
	},
	logout() {
		persistToken(null);
		set({ user: null, token: null, members: [], error: null });
	},
	clearError() {
		if (get().error) set({ error: null });
	},
}));
