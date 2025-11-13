import { create } from 'zustand';

interface User {
	id: string;
	email: string;
	name: string;
	role: 'owner' | 'admin' | 'editor';
}

interface Credentials extends User {
	password: string;
}

interface AuthState {
	user: User | null;
	token: string | null;
	isLoading: boolean;
	error: string | null;
	users: Credentials[];
	login: (payload: { email: string; password: string }) => Promise<void>;
	register: (payload: { email: string; password: string; name: string }) => Promise<void>;
	updateProfile: (payload: { name: string }) => void;
	updateUserRole: (userId: string, role: User['role']) => void;
	logout: () => void;
	clearError: () => void;
}

const seedUsers: Credentials[] = [
	{
		id: 'owner',
		email: 'owner@gmail.com',
		name: 'Ирина',
		role: 'owner',
		password: 'owner',
	},
	{
		id: 'user-admin',
		email: 'admin@kr-life.ru',
		name: 'Алексей',
		role: 'admin',
		password: 'admin123',
	},
	{
		id: 'user-editor',
		email: 'editor@kr-life.ru',
		name: 'Мария',
		role: 'editor',
		password: 'editor123',
	},
];

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export const useAuthStore = create<AuthState>((set, get) => ({
	user: null,
	token: null,
	isLoading: false,
	error: null,
	users: seedUsers,
	async login({ email, password }) {
		set({ isLoading: true, error: null });
		await delay(600);

		const credentials = get().users.find((user) => user.email === email.trim().toLowerCase());

		if (!credentials || credentials.password !== password) {
			const errorMessage = 'Неверный email или пароль';
			set({ isLoading: false, error: errorMessage });
			throw new Error(errorMessage);
		}

		set({
			user: {
				id: credentials.id,
				email: credentials.email,
				name: credentials.name,
				role: credentials.role,
			},
			token: crypto.randomUUID(),
			isLoading: false,
			error: null,
		});
	},
	async register({ email, name, password }) {
		set({ isLoading: true, error: null });
		await delay(700);

		const emailNormalized = email.trim().toLowerCase();
		const existingUser = get().users.find((user) => user.email === emailNormalized);

		if (existingUser) {
			const errorMessage = 'Пользователь с таким email уже существует';
			set({ isLoading: false, error: errorMessage });
			throw new Error(errorMessage);
		}

		const newUser: Credentials = {
			id: crypto.randomUUID(),
			email: emailNormalized,
			name,
			role: 'editor',
			password,
		};

		set((state) => ({
			users: [...state.users, newUser],
			user: {
				id: newUser.id,
				email: newUser.email,
				name: newUser.name,
				role: newUser.role,
			},
			token: crypto.randomUUID(),
			isLoading: false,
			error: null,
		}));
	},
	updateProfile({ name }) {
		const currentUser = get().user;
		if (!currentUser) return;

		set((state) => ({
			user: { ...state.user!, name },
			users: state.users.map((candidate) => (candidate.id === currentUser.id ? { ...candidate, name } : candidate)),
		}));
	},
	updateUserRole(userId, role) {
		set((state) => {
			const updatedUsers = state.users.map((user) => (user.id === userId ? { ...user, role } : user));
			const currentUser = state.user && state.user.id === userId ? { ...state.user, role } : state.user;
			return {
				users: updatedUsers,
				user: currentUser ?? state.user,
			};
		});
	},
	logout() {
		set({ user: null, token: null, error: null });
	},
	clearError() {
		if (get().error) {
			set({ error: null });
		}
	},
}));
