'use client';

import {
  Show,
  SimpleShowLayout,
  TextField,
  EmailField,
  DateField,
  BooleanField,
  NumberField,
  useRecordContext,
  FunctionField,
} from 'react-admin';

// Роль badge
const RoleBadge = () => {
  const record = useRecordContext();
  if (!record) return null;

  const roleColors: Record<string, string> = {
    admin: 'bg-purple-100 text-purple-800',
    seller: 'bg-orange-100 text-orange-800',
    client: 'bg-blue-100 text-blue-800',
  };

  const roleNames: Record<string, string> = {
    admin: 'Админ',
    seller: 'Сатуучу',
    client: 'Сатып алуучу',
  };

  return (
    <span className={`px-3 py-1.5 rounded-full text-sm font-medium ${roleColors[record.role] || 'bg-gray-100'}`}>
      {roleNames[record.role] || record.role}
    </span>
  );
};

export const UserShow = () => (
  <Show title="Колдонуучу маалыматы">
    <SimpleShowLayout>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-4">
        {/* Негизги маалымат */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <h3 className="text-lg font-semibold mb-4 text-gray-800">📋 Негизги маалымат</h3>
          <div className="space-y-3">
            <div>
              <label className="text-sm text-gray-500">Аты-жөнү</label>
              <TextField source="full_name" className="block text-lg font-medium" />
            </div>
            <div>
              <label className="text-sm text-gray-500">Email</label>
              <EmailField source="email" className="block" />
            </div>
            <div>
              <label className="text-sm text-gray-500">Телефон</label>
              <TextField source="phone" className="block" emptyText="—" />
            </div>
            <div>
              <label className="text-sm text-gray-500">Роль</label>
              <div className="mt-1">
                <FunctionField render={() => <RoleBadge />} />
              </div>
            </div>
          </div>
        </div>

        {/* Статистика */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <h3 className="text-lg font-semibold mb-4 text-gray-800">📊 Статистика</h3>
          <div className="space-y-3">
            <div>
              <label className="text-sm text-gray-500">Монеталар</label>
              <NumberField source="coins" className="block text-xl font-bold text-yellow-600" />
            </div>
            <div>
              <label className="text-sm text-gray-500">Тастыкталганбы</label>
              <BooleanField source="is_verified" className="block" />
            </div>
          </div>
        </div>

        {/* Убакыт маалыматы */}
        <div className="bg-gray-50 p-4 rounded-lg md:col-span-2">
          <h3 className="text-lg font-semibold mb-4 text-gray-800">🕐 Убакыт маалыматы</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <label className="text-sm text-gray-500">Катталган</label>
              <DateField source="created_at" showTime className="block" />
            </div>
            <div>
              <label className="text-sm text-gray-500">Акыркы кирүү</label>
              <DateField source="last_login_at" showTime className="block" emptyText="—" />
            </div>
            <div>
              <label className="text-sm text-gray-500">Катталган IP</label>
              <TextField source="registration_ip" className="block font-mono text-sm" emptyText="—" />
            </div>
            <div>
              <label className="text-sm text-gray-500">Акыркы IP</label>
              <TextField source="last_login_ip" className="block font-mono text-sm" emptyText="—" />
            </div>
          </div>
        </div>
      </div>
    </SimpleShowLayout>
  </Show>
);