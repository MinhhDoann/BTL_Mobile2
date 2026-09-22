import { ADMIN_ENTITIES } from '@/src/constants/admin-entities';
import { fetchAdminRecord, saveAdminRecord } from '@/src/lib/api/admin-api';
import { AdminDashboardData, AdminEntity, AdminRecord } from '@/src/types/admin';
import { useEffect, useState } from 'react';
import { AdminDialog } from './AdminDialog.web';

type Props = { entity: AdminEntity; id: number | null; dashboard: AdminDashboardData; onClose: () => void; onSaved: () => Promise<void> };
export function AdminEntityForm({ entity, id, dashboard, onClose, onSaved }: Props) {
  const config = ADMIN_ENTITIES[entity];
  const [values, setValues] = useState<AdminRecord>({ role: 'user', is_premium: false, is_public: true, genres: [] });
  const [loading, setLoading] = useState(id !== null);
  const [ready, setReady] = useState(id === null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [retry, setRetry] = useState(0);
  useEffect(() => {
    if (id === null) return;
    let cancelled = false;
    setLoading(true);
    setError('');
    fetchAdminRecord(entity, id).then((record) => {
      if (cancelled) return;
      setValues({ ...record, password: '', release_date: typeof record.release_date === 'string' ? record.release_date.slice(0, 10) : '' });
      setReady(true);
    }).catch((err) => { if (!cancelled) setError(err.message); }).finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [entity, id, retry]);
  function change(key: string, value: AdminRecord[string]) {
    setValues((current) => ({ ...current, [key]: value, ...(entity === 'songs' && key === 'artist_id' ? { album_id: '' } : {}) }));
  }
  async function submit(event: React.FormEvent) {
    event.preventDefault();
    if (busy || !ready) return;
    setBusy(true);
    setError('');
    try {
      const data = Object.fromEntries(config.fields.map((field) => [field.key, values[field.key] ?? ''])) as AdminRecord;
      data.is_premium = Boolean(values.is_premium);
      data.is_public = Boolean(values.is_public);
      await saveAdminRecord(entity, id, data);
      await onSaved();
    } catch (err) { setError(err instanceof Error ? err.message : 'Không thể lưu dữ liệu.'); }
    finally { setBusy(false); }
  }
  return (
    <AdminDialog title={`${id === null ? 'Thêm' : 'Sửa'} ${config.title.toLowerCase()}${id === null ? '' : ` #${id}`}`} busy={busy} onClose={onClose}>
      {loading ? <p role="status">Đang tải dữ liệu...</p> : null}
      {error ? <p role="alert" className="admin-error">{error}</p> : null}
      {!loading && !ready ? <button type="button" onClick={() => setRetry((value) => value + 1)}>Thử lại</button> : null}
      <form onSubmit={submit}>
        <fieldset disabled={busy || loading || !ready}>
          {ready && config.fields.map((field) => {
            if (field.type === 'genres') {
              const selected = Array.isArray(values.genres) ? values.genres : [];
              return <fieldset key={field.key} className="admin-genre-options"><legend>Thể loại</legend>{dashboard.genres.map((genre) => <label key={genre.genre_id}><input type="checkbox" checked={selected.includes(genre.genre_id)} onChange={(event) => change('genres', event.target.checked ? [...selected, genre.genre_id] : selected.filter((item) => item !== genre.genre_id))} /> {genre.name}</label>)}</fieldset>;
            }
            if (field.type === 'checkbox') return <label className="admin-check" key={field.key}><input type="checkbox" checked={Boolean(values[field.key])} onChange={(event) => change(field.key, event.target.checked)} /> {field.label}</label>;
            const value = String(values[field.key] ?? '');
            const required = field.required || (field.key === 'password' && id === null);
            let options: { value: string; label: string }[] = [];
            if (field.options === 'roles') options = [{ value: 'user', label: 'Người dùng' }, { value: 'artist', label: 'Nghệ sĩ' }, { value: 'admin', label: 'Quản trị viên' }];
            if (field.options === 'artists') options = dashboard.artists.map((artist) => ({ value: String(artist.artist_id), label: `${artist.name} (#${artist.artist_id})` }));
            if (field.options === 'albums') options = dashboard.albums.filter((album) => !values.artist_id || album.artist_id === Number(values.artist_id)).map((album) => ({ value: String(album.album_id), label: `${album.title} (#${album.album_id})` }));
            return <label className="admin-field" key={field.key}>
              <span>{field.label}{required ? ' *' : ''}</span>
              {field.type === 'select' ? <select value={value} required={required} onChange={(event) => change(field.key, event.target.value)}><option value="">{required ? 'Chọn...' : 'Không chọn'}</option>{options.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}</select>
                : field.type === 'textarea' ? <textarea value={value} rows={4} maxLength={field.max} onChange={(event) => change(field.key, event.target.value)} />
                  : <input type={field.key === 'email' ? 'email' : field.type || 'text'} value={value} required={required} maxLength={field.max} min={field.type === 'number' ? 1 : undefined} step={field.type === 'number' ? 1 : undefined} autoComplete={field.type === 'password' ? 'new-password' : 'off'} onChange={(event) => change(field.key, event.target.value)} />}
            </label>;
          })}
        </fieldset>
        <div className="admin-actions"><button type="button" disabled={busy} onClick={onClose}>Hủy</button><button className="admin-primary" disabled={busy || loading || !ready} type="submit">{busy ? 'Đang lưu...' : 'Lưu'}</button></div>
      </form>
    </AdminDialog>
  );
}
