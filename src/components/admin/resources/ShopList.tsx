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
  ImageField,
  BooleanField,
} from 'react-admin';

// Фильтрлер
const shopFilters = [
  <SearchInput key="search" source="q" alwaysOn placeholder="Дүкөн издөө..." />,
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

// Верификация badge
const VerifiedBadge = () => {
  const record = useRecordContext();
  if (!record) return null;

  return record.is_verified ? (
    <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">
      ✓ Тастыкталган
    </span>
  ) : (
    <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs font-medium">
      Күтүүдө
    </span>
  );
};

export const ShopList = () => (
  <List
    filters={shopFilters}
    actions={<ListActions />}
    sort={{ field: 'created_at', order: 'DESC' }}
    perPage={25}
    title="🏪 Дүкөндөр"
  >
    <Datagrid bulkActionButtons={false}>
      <ImageField source="logo" label="" sx={{ '& img': { width: 40, height: 40, borderRadius: '50%', objectFit: 'cover' } }} />
      <TextField source="name" label="Аталышы" />
      <TextField source="description" label="Сүрөттөмө" />
      <FunctionField label="Статус" render={() => <VerifiedBadge />} />
      <NumberField source="rating" label="Рейтинг" />
      <NumberField source="total_sales" label="Сатуулар" />
      <DateField source="created_at" label="Түзүлгөн" showTime />
    </Datagrid>
  </List>
);