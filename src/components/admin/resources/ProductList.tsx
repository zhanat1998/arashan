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
  ReferenceField,
} from 'react-admin';

// Фильтрлер
const productFilters = [
  <SearchInput key="search" source="q" alwaysOn placeholder="Товар издөө..." />,
  <SelectInput
    key="status"
    source="status"
    choices={[
      { id: 'active', name: 'Активдүү' },
      { id: 'inactive', name: 'Активдүү эмес' },
      { id: 'out_of_stock', name: 'Түгөндү' },
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
    active: 'bg-green-100 text-green-800',
    inactive: 'bg-gray-100 text-gray-800',
    out_of_stock: 'bg-red-100 text-red-800',
  };

  const statusNames: Record<string, string> = {
    active: 'Активдүү',
    inactive: 'Активдүү эмес',
    out_of_stock: 'Түгөндү',
  };

  return (
    <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[record.status] || 'bg-gray-100'}`}>
      {statusNames[record.status] || record.status}
    </span>
  );
};

export const ProductList = () => (
  <List
    filters={productFilters}
    actions={<ListActions />}
    sort={{ field: 'created_at', order: 'DESC' }}
    perPage={25}
    title="📱 Товарлар"
  >
    <Datagrid bulkActionButtons={false}>
      <FunctionField
        label=""
        render={(record: any) => (
          record?.images?.[0] ? (
            <img
              src={record.images[0]}
              alt=""
              style={{ width: 50, height: 50, objectFit: 'cover', borderRadius: 8 }}
            />
          ) : (
            <div style={{ width: 50, height: 50, background: '#f3f4f6', borderRadius: 8 }} />
          )
        )}
      />
      <TextField source="name" label="Аталышы" />
      <ReferenceField source="shop_id" reference="shops" label="Дүкөн" link={false}>
        <TextField source="name" />
      </ReferenceField>
      <NumberField
        source="price"
        label="Баасы"
        options={{ style: 'currency', currency: 'KGS' }}
      />
      <NumberField
        source="original_price"
        label="Эски баа"
        options={{ style: 'currency', currency: 'KGS' }}
      />
      <NumberField source="stock" label="Калдык" />
      <FunctionField label="Статус" render={() => <StatusBadge />} />
      <NumberField source="rating" label="Рейтинг" />
      <DateField source="created_at" label="Түзүлгөн" />
    </Datagrid>
  </List>
);