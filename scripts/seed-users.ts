/**
 * Тест колдонуучуларды түзүү скрипти
 *
 * Иштетүү: npx tsx scripts/seed-users.ts
 */

import { createClient } from '@supabase/supabase-js';

// Supabase Admin Client (service_role key керек)
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ NEXT_PUBLIC_SUPABASE_URL жана SUPABASE_SERVICE_ROLE_KEY керек!');
  console.log('');
  console.log('.env.local файлына кошуңуз:');
  console.log('SUPABASE_SERVICE_ROLE_KEY=your_service_role_key');
  console.log('');
  console.log('Service role key Supabase Dashboard → Settings → API → service_role дан табылат');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

// Тест колдонуучулар
const testUsers = [
  {
    email: 'admin@pinduo.kg',
    password: 'Admin123!',
    full_name: 'Администратор',
    role: 'admin',
    phone: '+996700000001'
  },
  {
    email: 'seller@pinduo.kg',
    password: 'Seller123!',
    full_name: 'Сатуучу Тест',
    role: 'seller',
    phone: '+996700000002'
  },
  {
    email: 'user@pinduo.kg',
    password: 'User123!',
    full_name: 'Колдонуучу Тест',
    role: 'client',
    phone: '+996700000003'
  },
  {
    email: 'test@pinduo.kg',
    password: 'Test123!',
    full_name: 'Тест Юзер',
    role: 'client',
    phone: '+996700000004'
  }
];

async function seedUsers() {
  console.log('🚀 Тест колдонуучуларды түзүү башталды...\n');

  for (const user of testUsers) {
    try {
      // 1. Auth колдонуучу түзүү
      const { data: authData, error: authError } = await supabase.auth.admin.createUser({
        email: user.email,
        password: user.password,
        email_confirm: true, // Email автоматтык тастыкталсын
        user_metadata: {
          full_name: user.full_name,
          role: user.role
        }
      });

      if (authError) {
        if (authError.message.includes('already been registered')) {
          console.log(`⚠️  ${user.email} - мурунтан бар`);

          // Профилди жаңыртуу (role өзгөртүү)
          const { data: existingUser } = await supabase
            .from('users')
            .select('id')
            .eq('email', user.email)
            .single();

          if (existingUser) {
            await supabase
              .from('users')
              .update({ role: user.role, full_name: user.full_name })
              .eq('id', existingUser.id);
            console.log(`   ✓ Профил жаңыртылды (role: ${user.role})`);
          }
          continue;
        }
        throw authError;
      }

      // 2. Профил түзүү
      if (authData.user) {
        const { error: profileError } = await supabase
          .from('users')
          .upsert({
            id: authData.user.id,
            email: user.email,
            full_name: user.full_name,
            phone: user.phone,
            role: user.role,
            coins: 500, // Тест үчүн көбүрөөк монета
            is_verified: true,
            created_at: new Date().toISOString()
          });

        if (profileError) {
          console.error(`❌ ${user.email} профил катасы:`, profileError.message);
        } else {
          console.log(`✅ ${user.email} түзүлдү (role: ${user.role})`);
        }
      }
    } catch (err: any) {
      console.error(`❌ ${user.email} катасы:`, err.message);
    }
  }

  console.log('\n========================================');
  console.log('📋 ТЕСТ АККАУНТТАР:');
  console.log('========================================\n');

  testUsers.forEach(user => {
    console.log(`📧 ${user.email}`);
    console.log(`🔑 ${user.password}`);
    console.log(`👤 ${user.role.toUpperCase()}`);
    console.log('---');
  });

  console.log('\n✨ Бүттү! Жогорудагы аккаунттар менен кире аласыз.');
}

seedUsers().catch(console.error);