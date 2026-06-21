-- Test suite for Row Level Security policies on verificat.xyz schema

begin;
select plan(16);

-- 1. Check table existence
select has_table('profiles', 'profiles table should exist');
select has_table('sources', 'sources table should exist');
select has_table('claims', 'claims table should exist');
select has_table('fact_checks', 'fact_checks table should exist');
select has_table('verdicts', 'verdicts table should exist');
select has_table('verdict_sources', 'verdict_sources table should exist');
select has_table('audit_log', 'audit_log table should exist');

-- 2. Check Row Level Security is enabled on all tables
select is_rls_enabled('public', 'profiles', 'profiles RLS should be active');
select is_rls_enabled('public', 'sources', 'sources RLS should be active');
select is_rls_enabled('public', 'claims', 'claims RLS should be active');
select is_rls_enabled('public', 'fact_checks', 'fact_checks RLS should be active');
select is_rls_enabled('public', 'verdicts', 'verdicts RLS should be active');
select is_rls_enabled('public', 'verdict_sources', 'verdict_sources RLS should be active');
select is_rls_enabled('public', 'audit_log', 'audit_log RLS should be active');

-- 3. Verify public viewability rules
select policies_are('public', 'profiles', ARRAY[
  'Profiles are viewable by everyone',
  'Users can update their own profiles'
], 'profiles policies are configured correctly');

select policies_are('public', 'sources', ARRAY[
  'Sources are viewable by everyone',
  'Editors can insert sources',
  'Editors can update sources',
  'Editors can delete sources'
], 'sources policies are configured correctly');

select * from finish();
rollback;
