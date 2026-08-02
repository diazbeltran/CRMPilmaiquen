-- =====================================================================
-- Políticas de Storage para el bucket 'documentos' (idempotente)
-- Ejecutar en el SQL Editor si los uploads desde la app fallan con 403.
-- =====================================================================
insert into storage.buckets (id, name, public)
values ('documentos', 'documentos', false)
on conflict (id) do nothing;

drop policy if exists "Subir documentos autenticados" on storage.objects;
create policy "Subir documentos autenticados"
  on storage.objects for insert to authenticated
  with check (bucket_id = 'documentos');

drop policy if exists "Leer documentos autenticados" on storage.objects;
create policy "Leer documentos autenticados"
  on storage.objects for select to authenticated
  using (bucket_id = 'documentos');

drop policy if exists "Actualizar documentos propios" on storage.objects;
create policy "Actualizar documentos propios"
  on storage.objects for update to authenticated
  using (
    bucket_id = 'documentos'
    and (storage.foldername(name))[1] is not null
  );

drop policy if exists "Eliminar documentos propios" on storage.objects;
create policy "Eliminar documentos propios"
  on storage.objects for delete to authenticated
  using (
    bucket_id = 'documentos'
    and (storage.foldername(name))[1] is not null
  );
