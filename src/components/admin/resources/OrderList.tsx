'use client';

import {
  List,
  Datagrid,
  TextField,
  DateField,
  NumberField,
  SearchInput,
  SelectInput,
  FilterButton,
  TopToolbar,
  ExportButton,
  useRecordContext,
  FunctionField,
  ReferenceField,
} from 'react-admin';

// Фильтрлер
const orderFilters = [
  <SearchInput key="search" source="q" alwaysOn placeholder="Издөө..." />,
  <SelectInput
    key="status"
    source="status"
    choices={[
      { id: 'pending', name: 'Күтүүдө' },
      { id: 'processing', name: 'Иштетилүүдө' },
      { id: 'shipped', name: 'Жөнөтүлдү' },
      { id: 'delivered', name: 'Жеткирилди' },
      { id: 'cancelled', name: 'Жокко чыгарылды' },
    ]}
    emptyText="Бардыгы"
  />,
  <SelectInput
    key="payment_status"
    source="payment_status"
    choices={[
      { id: 'pending', name: 'Төлөнө элек' },
      { id: 'paid', name: 'Төлөндү' },
      { id: 'refunded', name: 'Кайтарылды' },
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

// Статус badge
const StatusBadge = () => {
  const record = useRecordContext();
  if (!record) return null;

  const statusColors: Record<string, string> = {
    pending: 'bg-yellow-100 text-yellow-800',
    processing: 'bg-blue-100 text-blue-800',
    shipped: 'bg-purple-100 text-purple-800',
    delivered: 'bg-green-100 text-green-800',
    cancelled: 'bg-red-100 text-red-800',
  };

  const statusNames: Record<string, string> = {
    pending: 'Күтүүдө',
    processing: 'Иштетилүүдө',
    shipped: 'Жөнөтүлдү',
    delivered: 'Жеткирилди',
    cancelled: 'Жокко чыгарылды',
  };

  return (
    <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[record.status] || 'bg-gray-100'}`}>
      {statusNames[record.status] || record.status}
    </span>
  );
};

// Төлөм статусу
const PaymentBadge = () => {
  const record = useRecordContext();
  if (!record) return null;

  const colors: Record<string, string> = {
    pending: 'bg-orange-100 text-orange-800',
    paid: 'bg-green-100 text-green-800',
    refunded: 'bg-gray-100 text-gray-800',
  };

  const names: Record<string, string> = {
    pending: 'Төлөнө элек',
    paid: 'Төлөндү',
    refunded: 'Кайтарылды',
  };

  return (
    <span className={`px-2 py-1 rounded-full text-xs font-medium ${colors[record.payment_status] || 'bg-gray-100'}`}>
      {names[record.payment_status] || record.payment_status}
    </span>
  );
};

export const OrderList = () => (
  <List
    filters={orderFilters}
    actions={<ListActions />}
    sort={{ field: 'created_at', order: 'DESC' }}
    perPage={25}
    title="📦 Заказдар"
  >
    <Datagrid bulkActionButtons={false}>
      <TextField source="id" label="ID" />
      <DateField source="created_at" label="Түзүлгөн" showTime />
      <ReferenceField source="user_id" reference="users" label="Сатып алуучу" link={false}>
        <TextField source="full_name" />
      </ReferenceField>
      <FunctionField label="Статус" render={() => <StatusBadge />} />
      <FunctionField label="Төлөм" render={() => <PaymentBadge />} />
      <NumberField
        source="total_amount"
        label="Сумма"
        options={{ style: 'currency', currency: 'KGS' }}
      />
      <TextField source="shipping_address" label="Дарек" />
    </Datagrid>
  </List>
);