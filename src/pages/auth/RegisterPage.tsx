import { Link, useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Input } from '../../components/ui/input';
import { Button } from '../../components/ui/button';
import { useAuthStore } from '../../store/auth';

type FormValues = {
  name: string;
  email: string;
  password: string;
};

export function RegisterPage() {
  const navigate = useNavigate();
  const registerUser = useAuthStore((state) => state.register);
  const isLoading = useAuthStore((state) => state.isLoading);
  const error = useAuthStore((state) => state.error);
  const clearError = useAuthStore((state) => state.clearError);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({
    defaultValues: { email: '', password: '', name: '' },
  });

  useEffect(() => {
    clearError();
    return () => clearError();
  }, [clearError]);

  const onSubmit = handleSubmit(async (values) => {
    try {
      await registerUser(values);
      navigate('/admin/sources');
    } catch {
      // error stored in state
    }
  });

  return (
    <div className="flex min-h-screen items-center justify-center bg-[rgb(var(--color-background))] px-4 py-12 transition-colors">
      <Card className="w-full max-w-md border border-[rgb(var(--color-border))] bg-[rgb(var(--color-surface))] shadow-[0_35px_60px_-35px_rgba(78,115,248,0.35)] transition-colors">
        <CardHeader className="space-y-3">
          <CardTitle className="text-2xl font-semibold text-[rgb(var(--color-foreground))]">Регистрация</CardTitle>
          <CardDescription className="text-sm text-muted">
            Создайте рабочий аккаунт, чтобы подключиться к системе управления контентом KR Life.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form className="flex flex-col gap-4" onSubmit={onSubmit}>
            <div className="flex flex-col gap-2">
              <label className="text-xs font-medium uppercase tracking-wide text-muted">Имя</label>
              <Input
                {...register('name', { required: 'Укажите имя' })}
                placeholder="Алексей"
                onFocus={clearError}
              />
              {errors.name ? <p className="text-xs text-rose-500">{errors.name.message}</p> : null}
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-xs font-medium uppercase tracking-wide text-muted">Email</label>
              <Input
                {...register('email', { required: 'Укажите email' })}
                type="email"
                placeholder="you@kr-life.ru"
                onFocus={clearError}
              />
              {errors.email ? <p className="text-xs text-rose-500">{errors.email.message}</p> : null}
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-xs font-medium uppercase tracking-wide text-muted">Пароль</label>
              <Input
                {...register('password', { required: 'Введите пароль', minLength: { value: 6, message: 'Минимум 6 символов' } })}
                type="password"
                placeholder="••••••••"
                onFocus={clearError}
              />
              {errors.password ? <p className="text-xs text-rose-500">{errors.password.message}</p> : null}
            </div>
            {error ? (
              <div className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-xs text-rose-600">
                {error}
              </div>
            ) : null}
            <Button type="submit" className="mt-2" disabled={isLoading}>
              {isLoading ? 'Создание аккаунта...' : 'Зарегистрироваться'}
            </Button>
            <p className="text-center text-xs text-muted">
              Уже есть учетная запись?{' '}
              <Link to="/login" className="font-medium text-foreground hover:opacity-80">
                Войдите
              </Link>
            </p>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

