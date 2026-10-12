import { ADMIN_ENTITIES } from '@/src/constants/admin-entities';
import { deleteAdminRecord, fetchAdminRows, previewAdminDelete, sendPayoutReceiptEmail } from '@/src/lib/api/admin-api';
import { AdminDashboardData, AdminEntity, AdminPage, AdminRecord, DeletePreview } from '@/src/types/admin';
import { formatCurrency } from '@/src/lib/format-currency';
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
  const [invoice, setInvoice] = useState<any>(null);
  const [recipientEmail, setRecipientEmail] = useState('');
  const [sendingEmail, setSendingEmail] = useState(false);
  const [emailStatus, setEmailStatus] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
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

  async function updatePayoutStatus(id: number, status: string) {
    if (busy) return;
    setBusy(true);
    setError('');
    try {
      const { saveAdminRecord } = await import('@/src/lib/api/admin-api');
      const record = data?.items.find((r) => r[config.id] === id);
      if (!record) throw new Error('Không tìm thấy bản ghi');
      await saveAdminRecord(entity, id, { ...record, status });
      setNotice(`Đã cập nhật trạng thái thành ${status}.`);
      setRevision((value) => value + 1);
      
      // Nếu duyệt, hiển thị hóa đơn
      if (status === 'approved') {
        const inv = {
          ...record,
          approved_at: new Date().toISOString(),
          admin: 'System Admin'
        };
        setInvoice(inv);
        setRecipientEmail(String(record.artist_email || ''));
        setEmailStatus(null);
      }
      
      await onChanged();
    } catch (err) { setError(err instanceof Error ? err.message : 'Không thể cập nhật trạng thái.'); }
    finally { setBusy(false); }
  }

  function downloadInvoiceImage(inv: any) {
    if (!inv) return;
    const canvas = document.createElement('canvas');
    const width = 560;
    const height = 660;
    canvas.width = width * 2;
    canvas.height = height * 2;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.scale(2, 2);

    // Background gradient
    const bgGrad = ctx.createLinearGradient(0, 0, 0, height);
    bgGrad.addColorStop(0, '#0f172a');
    bgGrad.addColorStop(1, '#1e293b');
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, width, height);

    // Border
    ctx.strokeStyle = '#334155';
    ctx.lineWidth = 2;
    ctx.strokeRect(12, 12, width - 24, height - 24);

    // Accent bar
    ctx.fillStyle = '#10b981';
    ctx.fillRect(12, 12, width - 24, 6);

    // Header title
    ctx.textAlign = 'center';
    ctx.fillStyle = '#38bdf8';
    ctx.font = 'bold 22px system-ui, -apple-system, sans-serif';
    ctx.fillText('BIÊN LAI CHUYỂN TIỀN NGHỆ SĨ', width / 2, 56);

    ctx.fillStyle = '#94a3b8';
    ctx.font = '13px system-ui, -apple-system, sans-serif';
    ctx.fillText('MOBILE2 MUSIC ENTERTAINMENT PLATFORM', width / 2, 78);

    // Dashed divider
    ctx.strokeStyle = '#475569';
    ctx.lineWidth = 1;
    ctx.setLineDash([5, 4]);
    ctx.beginPath();
    ctx.moveTo(35, 96);
    ctx.lineTo(width - 35, 96);
    ctx.stroke();
    ctx.setLineDash([]);

    // Card background
    ctx.fillStyle = '#111c30';
    if (typeof (ctx as any).roundRect === 'function') {
      (ctx as any).roundRect(30, 115, width - 60, 420, 12);
      ctx.fill();
    } else {
      ctx.fillRect(30, 115, width - 60, 420);
    }
    ctx.strokeStyle = '#253247';
    ctx.stroke();

    const rows = [
      { label: 'Mã giao dịch:', value: `#${inv.request_id ?? '—'}` },
      { label: 'Thời gian duyệt:', value: new Date(inv.approved_at || Date.now()).toLocaleString('vi-VN') },
      { label: 'Nghệ sĩ nhận:', value: inv.artist_name || 'Nghệ sĩ' },
      { label: 'Email tài khoản:', value: recipientEmail || inv.artist_email || '—' },
      { label: 'Ngân hàng:', value: inv.bank_name || '—' },
      { label: 'Số tài khoản:', value: inv.account_number || '—' },
      { label: 'Chủ tài khoản:', value: String(inv.account_holder || '—').toUpperCase() },
      { label: 'Trạng thái:', value: 'HOÀN TẤT (THÀNH CÔNG)', highlight: '#10b981' },
    ];

    let currentY = 152;
    for (const item of rows) {
      ctx.textAlign = 'left';
      ctx.fillStyle = '#94a3b8';
      ctx.font = '14px system-ui, -apple-system, sans-serif';
      ctx.fillText(item.label, 52, currentY);

      ctx.textAlign = 'right';
      ctx.fillStyle = item.highlight || '#f8fafc';
      ctx.font = item.highlight ? 'bold 14px system-ui, -apple-system, sans-serif' : '500 14px system-ui, -apple-system, sans-serif';
      ctx.fillText(item.value, width - 52, currentY);

      currentY += 34;
    }

    // Amount divider
    ctx.strokeStyle = '#334155';
    ctx.beginPath();
    ctx.moveTo(52, currentY);
    ctx.lineTo(width - 52, currentY);
    ctx.stroke();

    currentY += 38;
    ctx.textAlign = 'left';
    ctx.fillStyle = '#cbd5e1';
    ctx.font = 'bold 15px system-ui, -apple-system, sans-serif';
    ctx.fillText('Số tiền chuyển:', 52, currentY);

    ctx.textAlign = 'right';
    ctx.fillStyle = '#10b981';
    ctx.font = 'bold 22px system-ui, -apple-system, sans-serif';
    ctx.fillText(`${formatCurrency(inv.amount)} VNĐ`, width - 52, currentY);

    // Footer
    ctx.textAlign = 'center';
    ctx.fillStyle = '#64748b';
    ctx.font = 'italic 12px system-ui, -apple-system, sans-serif';
    ctx.fillText('Biên lai được phát hành tự động từ hệ thống Mobile2 Music.', width / 2, 572);
    ctx.fillText('Đã ghi nhận giao dịch vào sổ kế toán đối soát.', width / 2, 592);

    const link = document.createElement('a');
    link.download = `bien-lai-chuyen-tien-${inv.request_id || Date.now()}.png`;
    link.href = canvas.toDataURL('image/png');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  async function handleSendEmail(inv: any) {
    if (!inv || sendingEmail) return;
    const targetEmail = (recipientEmail || inv.artist_email || '').trim();
    if (!targetEmail) {
      setEmailStatus({ type: 'error', message: 'Vui lòng nhập địa chỉ Gmail để gửi biên lai.' });
      return;
    }
    setSendingEmail(true);
    setEmailStatus(null);
    try {
      const res = await sendPayoutReceiptEmail(Number(inv.request_id), targetEmail);
      setEmailStatus({ type: 'success', message: res.message || `Đã gửi biên lai tới ${targetEmail} thành công!` });
    } catch (err: any) {
      setEmailStatus({ type: 'error', message: err?.message || 'Không thể gửi email. Vui lòng kiểm tra lại.' });
    } finally {
      setSendingEmail(false);
    }
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
          return <tr key={id}>
            {config.columns.map((column) => <td key={column.key}><span title={display(record, column.key)}>{display(record, column.key)}</span></td>)}
            <td>
              <div className="admin-row-actions">
                {entity === 'payout_requests' ? (
                  record.status === 'pending' ? (
                    <>
                      <button type="button" className="admin-primary" disabled={loading || busy} aria-label={`Duyệt ${label}`} onClick={() => void updatePayoutStatus(id, 'approved')}>Duyệt</button>
                      <button type="button" className="admin-danger" disabled={loading || busy} aria-label={`Từ chối ${label}`} onClick={() => void updatePayoutStatus(id, 'rejected')}>Từ chối</button>
                    </>
                  ) : (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span>{record.status === 'approved' ? 'Đã duyệt' : 'Đã từ chối'}</span>
                      {record.status === 'approved' ? (
                        <button
                          type="button"
                          aria-label={`Xem biên lai ${label}`}
                          onClick={() => {
                            setInvoice({
                              ...record,
                              approved_at: record.created_at || new Date().toISOString(),
                              admin: 'System Admin',
                            });
                            setRecipientEmail(String(record.artist_email || ''));
                            setEmailStatus(null);
                          }}
                          style={{ padding: '4px 8px', fontSize: 12, border: '1px solid #38bdf8', color: '#38bdf8', background: 'transparent' }}
                        >
                          Biên lai
                        </button>
                      ) : null}
                    </div>
                  )
                ) : (
                  <>
                    <button type="button" disabled={loading || busy} aria-label={`Sửa ${label}`} onClick={() => setEditing({ id })}>Sửa</button>
                    <button type="button" className="admin-danger" disabled={loading || busy || (entity === 'users' && id === currentUserId)} aria-label={`Xóa ${label}`} onClick={() => void beginDelete(id)}>Xóa</button>
                  </>
                )}
              </div>
            </td>
          </tr>;
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
    {invoice ? <AdminDialog title={`BIÊN LAI CHUYỂN TIỀN NGHỆ SĨ`} busy={sendingEmail} onClose={() => { setInvoice(null); setEmailStatus(null); }}>
      <div style={{ padding: 20, background: '#0f172a', color: '#f8fafc', borderRadius: 12, border: '1px solid #334155', lineHeight: 1.6, marginTop: 10 }}>
        <div style={{ textAlign: 'center', borderBottom: '1px dashed #475569', paddingBottom: 16, marginBottom: 16 }}>
          <h3 style={{ margin: '0 0 6px 0', color: '#38bdf8', fontSize: 18 }}>BIÊN LAI CHUYỂN TIỀN NGHỆ SĨ</h3>
          <span style={{ fontSize: 12, color: '#94a3b8' }}>Mobile2 Music Platform</span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '150px 1fr', gap: '8px 12px', fontSize: 13 }}>
          <span style={{ color: '#94a3b8' }}>Mã giao dịch:</span>
          <strong>#{invoice.request_id}</strong>

          <span style={{ color: '#94a3b8' }}>Ngày duyệt:</span>
          <span>{new Date(invoice.approved_at || Date.now()).toLocaleString('vi-VN')}</span>

          <span style={{ color: '#94a3b8' }}>Nghệ sĩ nhận:</span>
          <span style={{ color: '#38bdf8', fontWeight: 600 }}>{invoice.artist_name || 'Nghệ sĩ'}</span>

          <span style={{ color: '#94a3b8' }}>Số tiền thanh toán:</span>
          <span style={{ fontSize: 18, fontWeight: 'bold', color: '#10b981' }}>{formatCurrency(invoice.amount)} VNĐ</span>

          <span style={{ color: '#94a3b8' }}>Ngân hàng:</span>
          <span>{invoice.bank_name || '—'}</span>

          <span style={{ color: '#94a3b8' }}>Số tài khoản:</span>
          <span style={{ fontFamily: 'monospace' }}>{invoice.account_number || '—'}</span>

          <span style={{ color: '#94a3b8' }}>Chủ tài khoản:</span>
          <span style={{ textTransform: 'uppercase' }}>{invoice.account_holder || '—'}</span>
        </div>

        <hr style={{ border: 'none', borderTop: '1px dashed #334155', margin: '16px 0' }}/>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          <label style={{ fontSize: 13, color: '#cbd5e1', fontWeight: 600 }}>
            Gmail nghệ sĩ nhận biên lai:
          </label>
          <div style={{ display: 'flex', gap: 8 }}>
            <input
              type="email"
              placeholder="Nhập địa chỉ Gmail nghệ sĩ..."
              value={recipientEmail}
              onChange={(e) => setRecipientEmail(e.target.value)}
              style={{ flex: 1, padding: '8px 12px', borderRadius: 6, background: '#1e293b', border: '1px solid #475569', color: '#fff' }}
            />
            <button
              type="button"
              className="admin-primary"
              disabled={sendingEmail}
              onClick={() => void handleSendEmail(invoice)}
              style={{ display: 'flex', alignItems: 'center', gap: 6, whiteSpace: 'nowrap', padding: '8px 14px' }}
            >
              {sendingEmail ? 'Đang gửi...' : '✉️ Gửi Đến Gmail'}
            </button>
          </div>
          {emailStatus ? (
            <p style={{ margin: '6px 0 0 0', fontSize: 13, color: emailStatus.type === 'success' ? '#10b981' : '#f87171' }}>
              {emailStatus.message}
            </p>
          ) : (
            <p style={{ margin: '4px 0 0 0', fontSize: 12, color: '#94a3b8' }}>
              Biên lai sẽ được gửi kèm định dạng HTML chuyên nghiệp đến hộp thư của nghệ sĩ.
            </p>
          )}
        </div>
      </div>

      <div className="admin-actions" style={{ marginTop: 20, display: 'flex', gap: 10, flexWrap: 'wrap', justifyContent: 'flex-end' }}>
        <button
          type="button"
          onClick={() => downloadInvoiceImage(invoice)}
          style={{ background: '#0284c7', borderColor: '#38bdf8', color: '#fff', display: 'flex', alignItems: 'center', gap: 6 }}
        >
          📥 Lưu Ảnh Biên Lai
        </button>
        <button
          type="button"
          onClick={() => window.print()}
          style={{ display: 'flex', alignItems: 'center', gap: 6 }}
        >
          🖨️ In Hóa Đơn
        </button>
        <button
          type="button"
          onClick={() => { setInvoice(null); setEmailStatus(null); }}
        >
          Đóng
        </button>
      </div>
    </AdminDialog> : null}
  </section>;
}
