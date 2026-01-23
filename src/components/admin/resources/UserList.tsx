'use client';

import {
  List,
  Datagrid,
  TextField,
  EmailField,
  DateField,
  BooleanField,
  NumberField,
  SearchInput,
  SelectInput,
  FilterButton,
  TopToolbar,
  ExportButton,
  useRecordContext,
  FunctionField,
} from 'react-admin';

// Фильтрлер
const userFilters = [
  <SearchInput key="search" source="q" alwaysOn placeholder="Издөө..." />,
  <SelectInput
    key="role"
    source="role"
    choices={[
      { id: 'client', name: 'Сатып алуучу' },
      { id: 'seller', name: 'Сатуучу' },
      { id: 'admin', name: 'Админ' },
    ]}
    emptyText="Бардыгы"
  />,
  <SelectInput
    key="verified"
    source="is_verified"
    choices={[
      { id: true, name: 'Тастыкталган' },
      { id: false, name: 'Тастыкталган эмес' },
    ]}
    emptyText="Бардыгы"
  />,
];

// Toolbar
const ListActions = () => (
  <TopToolbar>
    <FilterButton />
    <ExportButton />
  </TopToolbar>
);

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
    <span className={`px-2 py-1 rounded-full text-xs font-medium ${roleColors[record.role] || 'bg-gray-100'}`}>
      {roleNames[record.role] || record.role}
    </span>
  );
};

// Верификация badge
const VerifiedBadge = () => {
  const record = useRecordContext();
  if (!record) return null;

  return record.is_verified ? (
    <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">
      ✓ Тастыкталган
    </span>
  ) : (
    <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded-full text-xs font-medium">
      Күтүүдө
    </span>
  );
};

export const UserList = () => (
  <List
    filters={userFilters}
    actions={<ListActions />}
    sort={{ field: 'created_at', order: 'DESC' }}
    perPage={25}
    title="👥 Колдонуучулар"
  >
    <Datagrid rowClick="show" bulkActionButtons={false}>
      <DateField source="created_at" label="Катталган" showTime />
      <TextField source="full_name" label="Аты-жөнү" />
      <EmailField source="email" label="Email" />
      <TextField source="phone" label="Телефон" />
      <FunctionField label="Роль" render={() => <RoleBadge />} />
      <NumberField source="coins" label="Монеталар" />
      <FunctionField label="Статус" render={() => <VerifiedBadge />} />
      <DateField source="last_login_at" label="Акыркы кирүү" showTime />
    </Datagrid>
  </List>
);