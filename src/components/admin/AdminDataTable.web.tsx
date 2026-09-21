import { ADMIN_ENTITIES } from '@/src/constants/admin-entities';
import { deleteAdminRecord, fetchAdminRows, previewAdminDelete } from '@/src/lib/api/admin-api';
import { AdminDashboardData, AdminEntity, AdminPage, AdminRecord, DeletePreview } from '@/src/types/admin';
import { useEffect, useRef, useState } from 'react';
import { AdminDialog } from './AdminDialog.web';
import { AdminEntityForm } from './AdminEntityForm.web';

type Props = { entity: AdminEntity; dashboard: AdminDashboardData; currentUserId?: number; onChanged: () => Promise<void>; onCreateSong: () => void };
export function AdminDataTable({ entity, dashboard, currentUserId, onChanged, onCreateSong }: Props) {
  const config = ADMIN_ENTITIES[entity];
  const [query, setQuery] = useState('');
  const [page, setPage] = useState(1);
  const [data, setData] = useState<AdminPage | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [revision, setRevision] = useState(0);
  const [editing, setEditing] = useState<{ id: number | null } | null>(null);
  const [deleting, setDeleting] = useState<{ id: number; preview: DeletePreview } | null>(null);
  const [busy, setBusy] = useState(false);
  const operation = useRef(0);
  useEffect(() => () => { operation.current++; }, []);
  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError('');
    const timeout = setTimeout(() => {
      fetchAdminRows(entity, page, query).then((result) => {
        if (!cancelled) setData(result);
      }).catch((err) => { if (!cancelled) { setError(err.message); setData(null); } }).finally(() => { if (!cancelled) setLoading(false); });
    }, 250);
    return () => { cancelled = true; clearTimeout(timeout); };
  }, [entity, page, query, revision]);
  async function saved() {
    setEditing(null);
    setNotice('Đã lưu dữ liệu.');
    setRevision((value) => value + 1);
    await onChanged();
  }
  async function beginDelete(id: number) {
    if (busy) return;
    const current = ++operation.current;
    setBusy(true);
    setError('');
    try {
      const preview = await previewAdminDelete(entity, id);
      if (operation.current === current) setDeleting({ id, preview });
    } catch (err) { if (operation.current === current) setError(err instanceof Error ? err.message : 'Không thể kiểm tra dữ liệu.'); }
    finally { if (operation.current === current) setBusy(false); }
  }
  async function remove() {
    if (!deleting || busy) return;
    setBusy(true);
    setError('');
    try {
      await deleteAdminRecord(entity, deleting.id, deleting.preview.confirmation);
      setDeleting(null);
      setNotice('Đã xóa dữ liệu.');
      setRevision((value) => value + 1);
      await onChanged();
    } catch (err) { setError(err instanceof Error ? err.message : 'Không thể xóa dữ liệu.'); }
    finally { setBusy(false); }
  }
  function display(record: AdminRecord, key: string) {
    const value = record[key];
    if (key === 'is_premium' || key === 'is_public') return value ? 'Có' : 'Không';
    if (value === null || value === undefined || value === '') return '—';
    return key === 'release_date' ? String(value).slice(0, 10) : String(value);
  }
  return <section className="admin-data" aria-label={`Danh sách ${config.title.toLowerCase()}`}>
    <style>{`
      .admin-data { color:#e2e8f0; font-family:system-ui,sans-serif; font-size:14px; }
      .admin-data *, .admin-dialog * { box-sizing:border-box; }
      .admin-data button,.admin-dialog button { border:1px solid #475569; border-radius:8px; background:#1e293b; color:#f8fafc; padding:10px 14px; cursor:pointer; font:inherit; }
      .admin-data button:disabled,.admin-dialog button:disabled { opacity:.45; cursor:default; }
      .admin-data button:focus-visible,.admin-dialog button:focus-visible,.admin-data input:focus-visible,.admin-dialog input:focus-visible,.admin-dialog select:focus-visible,.admin-dialog textarea:focus-visible { outline:2px solid #a78bfa; outline-offset:2px; }
      .admin-data .admin-primary,.admin-dialog .admin-primary { background:#7c3aed; border-color:#8b5cf6; }
      .admin-data .admin-danger,.admin-dialog .admin-danger { color:#fda4af; border-color:#9f1239; }
      .admin-toolbar,.admin-pagination,.admin-actions { display:flex; gap:12px; align-items:center; justify-content:space-between; flex-wrap:wrap; margin:16px 0; }
      .admin-toolbar input { flex:1; min-width:160px; }
      .admin-data input,.admin-dialog input:not([type=checkbox]),.admin-dialog select,.admin-dialog textarea { background:#0f172a; color:#f8fafc; border:1px solid #475569; padding:12px; border-radius:8px; font:inherit; }
      .admin-table-scroll { overflow-x:auto; border:1px solid #334155; border-radius:12px; }
      .admin-data table { border-collapse:collapse; width:100%; min-width:650px; text-align:left; }
      .admin-data th { background:#1e293b; color:#c4b5fd; white-space:nowrap; }
      .admin-data th,.admin-data td { padding:14px 16px; border-bottom:1px solid #253247; }
      .admin-data tbody tr:hover { background:#111c30; }
      .admin-data td > span { display:block; max-width:280px; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }
      .admin-row-actions { display:flex; gap:8px; }
      .admin-dialog { color:#e2e8f0; background:#111827; border:1px solid #475569; border-radius:16px; padding:28px; width:min(620px, calc(100vw - 32px)); max-height:85vh; overflow:auto; font:14px system-ui,sans-serif; }
      .admin-dialog::backdrop { background:rgba(0,0,0,.7); }
      .admin-dialog h2 { margin-top:0; }
      .admin-dialog fieldset { border:0; padding:0; margin:0; min-width:0; }
      .admin-field { display:flex; flex-direction:column; gap:8px; margin:16px 0; }
      .admin-check { display:block; margin:16px 0; }
      .admin-dialog .admin-genre-options { display:flex; gap:12px; flex-wrap:wrap; margin:16px 0; }
      .admin-genre-options legend { margin-bottom:10px; }
      .admin-error { color:#fda4af; }
      .admin-notice { color:#86efac; }
      .admin-dialog .admin-actions { justify-content:flex-end; margin-bottom:0; }
    `}</style>
    <div className="admin-toolbar">
      <input aria-label={`Tìm kiếm ${config.title.toLowerCase()}`} placeholder="Tìm theo tên hoặc email / nghệ sĩ / người sở hữu..." maxLength={100} value={query} onChange={(event) => { setQuery(event.target.value); setPage(1); }} />
      <button type="button" className="admin-primary" onClick={() => entity === 'songs' ? onCreateSong() : setEditing({ id: null })}>+ Thêm {config.title.toLowerCase()}</button>
      <button type="button" disabled={loading} onClick={() => setRevision((value) => value + 1)}>Làm mới</button>
    </div>
    {error && !deleting ? <p role="alert" className="admin-error">{error}</p> : null}
    {notice ? <p role="status" className="admin-notice">{notice}</p> : null}
    {loading ? <p role="status">Đang tải danh sách...</p> : null}
    {busy && !deleting ? <p role="status">Đang kiểm tra dữ liệu liên quan...</p> : null}
    <div className="admin-table-scroll" aria-busy={loading}>
      <table>
        <thead><tr>{config.columns.map((column) => <th scope="col" key={column.key}>{column.label}</th>)}<th scope="col">Thao tác</th></tr></thead>
        <tbody>{data?.items.map((record) => {
          const id = Number(record[config.id]);
          const label = String(record.title ?? record.name ?? record.username ?? id);
          return <tr key={id}>{config.columns.map((column) => <td key={column.key}><span title={display(record, column.key)}>{display(record, column.key)}</span></td>)}<td><div className="admin-row-actions"><button type="button" disabled={loading || busy} aria-label={`Sửa ${label}`} onClick={() => setEditing({ id })}>Sửa</button><button type="button" className="admin-danger" disabled={loading || busy || (entity === 'users' && id === currentUserId)} aria-label={`Xóa ${label}`} onClick={() => void beginDelete(id)}>Xóa</button></div></td></tr>;
        })}{!loading && data?.items.length === 0 ? <tr><td colSpan={config.columns.length + 1}>Không có dữ liệu phù hợp.</td></tr> : null}</tbody>
      </table>
    </div>
    {data ? <div className="admin-pagination"><span>{data.total} bản ghi · Trang {data.page}/{Math.max(1, Math.ceil(data.total / data.pageSize))}</span><div className="admin-row-actions"><button disabled={loading || data.page <= 1} onClick={() => setPage(data.page - 1)}>Trang trước</button><button disabled={loading || data.page * data.pageSize >= data.total} onClick={() => setPage(data.page + 1)}>Trang sau</button></div></div> : null}
    {editing ? <AdminEntityForm entity={entity} id={editing.id} dashboard={dashboard} onClose={() => setEditing(null)} onSaved={saved} /> : null}
    {deleting ? <AdminDialog title={`Xóa “${deleting.preview.label}”?`} busy={busy} onClose={() => { setDeleting(null); setError(''); }}>
      <p>Bản ghi #{deleting.id} sẽ bị xóa vĩnh viễn.</p>
      {deleting.preview.impacts.length ? <ul>{deleting.preview.impacts.map((impact) => <li key={impact.label}>{impact.label}: <strong>{impact.count}</strong></li>)}</ul> : <p>Không có bản ghi liên quan bị ảnh hưởng.</p>}
      {error ? <p role="alert" className="admin-error">{error}</p> : null}
      <div className="admin-actions"><button disabled={busy} onClick={() => { setDeleting(null); setError(''); }}>Hủy</button><button className="admin-danger" disabled={busy} onClick={() => void remove()}>{busy ? 'Đang xóa...' : 'Xác nhận xóa'}</button></div>
    </AdminDialog> : null}
  </section>;
}
