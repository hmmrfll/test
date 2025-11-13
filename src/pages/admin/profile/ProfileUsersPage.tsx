import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../../components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../../components/ui/table';
import { Select } from '../../../components/ui/select';
import { Badge } from '../../../components/ui/badge';
import { useAuthStore } from '../../../store/auth';

const roleLabels: Record<'owner' | 'admin' | 'editor', string> = {
  owner: 'Владелец',
  admin: 'Администратор',
  editor: 'Редактор',
};

export function ProfileUsersPage() {
  const currentUser = useAuthStore((state) => state.user);
  const members = useAuthStore((state) => state.users);
  const updateUserRole = useAuthStore((state) => state.updateUserRole);

  if (currentUser?.role !== 'owner') {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Недостаточно прав</CardTitle>
          <CardDescription>Только владелец может управлять командой.</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  const visibleMembers = members.map(({ password, ...rest }) => rest);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Команда</CardTitle>
        <CardDescription>Управляйте ролями пользователей, подключенных к платформе.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="mb-4 flex items-center justify-between text-sm text-muted">
          <span>Всего пользователей: {visibleMembers.length}</span>
          <span>
            Редакторы:{' '}
            {
              visibleMembers.filter((member) => member.role === 'editor').length
            }
          </span>
        </div>
        <div className="overflow-auto rounded-xl border border-[rgb(var(--color-border))]">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Имя</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Роль</TableHead>
                <TableHead className="text-right">Действия</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {visibleMembers.map((member) => {
                const isOwner = member.role === 'owner';
                return (
                  <TableRow key={member.id} className="border-b border-[rgb(var(--color-border))]">
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="font-medium text-foreground">{member.name}</span>
                        <span className="text-xs text-muted">{roleLabels[member.role]}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-sm text-muted">{member.email}</TableCell>
                    <TableCell>
                      <Badge variant="secondary">{roleLabels[member.role]}</Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Select
                        value={member.role}
                        disabled={isOwner}
                        onChange={(event) => updateUserRole(member.id, event.target.value as typeof member.role)}
                      >
                        <option value="admin">Администратор</option>
                        <option value="editor">Редактор</option>
                        <option value="owner" disabled>
                          Владелец
                        </option>
                      </Select>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}

