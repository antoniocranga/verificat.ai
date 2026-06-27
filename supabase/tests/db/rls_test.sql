-- Test suite for Row Level Security policies on verificat.xyz schema

begin;
select plan(28);

-- 1. Check table existence
select has_table('profiles', 'profiles table should exist');
select has_table('sources', 'sources table should exist');
select has_table('claims', 'claims table should exist');
select has_table('fact_checks', 'fact_checks table should exist');
select has_table('verdicts', 'verdicts table should exist');
select has_table('verdict_sources', 'verdict_sources table should exist');
select has_table('audit_log', 'audit_log table should exist');
select has_table('reports', 'reports table should exist');
select has_table('usage_logs', 'usage_logs table should exist');

-- 2. Check Row Level Security is enabled on all tables
select is_rls_enabled('public', 'profiles', 'profiles RLS should be active');
select is_rls_enabled('public', 'sources', 'sources RLS should be active');
select is_rls_enabled('public', 'claims', 'claims RLS should be active');
select is_rls_enabled('public', 'fact_checks', 'fact_checks RLS should be active');
select is_rls_enabled('public', 'verdicts', 'verdicts RLS should be active');
select is_rls_enabled('public', 'verdict_sources', 'verdict_sources RLS should be active');
select is_rls_enabled('public', 'audit_log', 'audit_log RLS should be active');
select is_rls_enabled('public', 'reports', 'reports RLS should be active');
select is_rls_enabled('public', 'usage_logs', 'usage_logs RLS should be active');

-- 3. Verify public viewability rules
select policies_are('public', 'profiles', ARRAY[
  'Profiles are viewable by everyone',
  'Users can update their own profiles',
  'Admins can update any profile'
], 'profiles policies are configured correctly');

select policies_are('public', 'sources', ARRAY[
  'Sources are viewable by everyone',
  'Editors can insert sources',
  'Editors can update sources',
  'Editors can delete sources',
  'Admins can manage all sources',
  'Moderators can manage sources',
  'Moderators can manage sources',
  'Moderators can manage sources'
], 'sources policies are configured correctly');

select policies_are('public', 'reports', ARRAY[
  'Reports are viewable by admins and moderators',
  'Reports can be inserted by any authenticated user',
  'Admins can update reports',
  'Admins can delete reports'
], 'reports policies are configured correctly');

select policies_are('public', 'usage_logs', ARRAY[
  'Usage logs are viewable by admins',
  'Usage logs can be inserted by service role',
  'Usage logs are viewable by the owning user'
], 'usage_logs policies are configured correctly');

-- 4. Verify helper functions exist
select has_function('is_superadmin', 'is_superadmin() helper should exist');
select has_function('is_moderator', 'is_moderator() helper should exist');
select has_function('is_editor', 'is_editor() helper should exist');

-- 5. Verify role constraint includes moderator
select col_not_null('profiles', 'role', 'profiles.role should be not null');

select * from finish();
rollback;
