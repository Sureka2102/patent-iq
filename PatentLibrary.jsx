import { useEffect, useState } from 'react'
import { ExternalLink, FileText, Library, Upload } from 'lucide-react'
import { patentsAPI } from '../services/api'

export default function PatentLibrary() {
  const [records, setRecords] = useState([])
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [file, setFile] = useState(null)
  const [form, setForm] = useState({
    title: '',
    publication_number: '',
    jurisdiction: '',
    source_url: '',
  })
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')

  const loadRecords = () => patentsAPI.list()
    .then(response => {
      setRecords(response.data)
      setError('')
    })
    .catch(err => setError(err.response?.data?.detail || 'Could not load the patent library.'))

  useEffect(() => {
    loadRecords().finally(() => setLoading(false))
  }, [])

  const handleUpload = async event => {
    event.preventDefault()
    if (!file) {
      setError('Choose a PDF patent document to upload.')
      return
    }

    setUploading(true)
    setError('')
    setNotice('')
    try {
      const data = new FormData()
      data.append('file', file)
      Object.entries(form).forEach(([key, value]) => {
        if (value.trim()) data.append(key, value.trim())
      })
      await patentsAPI.upload(data)
      setFile(null)
      setForm({ title: '', publication_number: '', jurisdiction: '', source_url: '' })
      setNotice('Patent PDF indexed in the shared local library.')
      await loadRecords()
    } catch (err) {
      setError(err.response?.data?.detail || 'Patent PDF could not be indexed.')
    } finally {
      setUploading(false)
    }
  }

  const inputStyle = {
    width: '100%', padding: '10px 12px', border: '1px solid #e5e5e5',
    borderRadius: 9, background: '#fff', color: '#262626', fontSize: 13,
  }

  return (
    <div style={{ background: '#fafafa', minHeight: '100vh', paddingBottom: 80 }}>
      <div className="container" style={{ paddingTop: 36 }}>
        <div style={{ marginBottom: 24 }}>
          <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#a3a3a3', marginBottom: 6 }}>Local search corpus</div>
          <h1 style={{ fontSize: 28, fontWeight: 800, color: '#000', letterSpacing: '-0.04em' }}>Patent Library</h1>
          <p style={{ color: '#737373', marginTop: 6, fontSize: 14 }}>Import readable patent PDFs to index them locally for similarity search.</p>
        </div>

        <div style={{ padding: '12px 15px', marginBottom: 18, borderRadius: 10, border: '1px solid #fde68a', background: '#fffbeb', color: '#854d0e', fontSize: 12, lineHeight: 1.6 }}>
          This library is shared by signed-in users of this app. PDFs must contain selectable text; scanned PDFs need OCR before import.
        </div>

        {error && <div role="alert" style={{ padding: '11px 14px', marginBottom: 16, borderRadius: 9, background: '#fff1f2', color: '#be123c', fontSize: 13 }}>{error}</div>}
        {notice && <div role="status" style={{ padding: '11px 14px', marginBottom: 16, borderRadius: 9, background: '#f0fdf4', color: '#15803d', fontSize: 13 }}>{notice}</div>}

        <div className="patent-library-grid" style={{ display: 'grid', gridTemplateColumns: 'minmax(280px, 360px) minmax(0, 1fr)', gap: 18, alignItems: 'start' }}>
          <form onSubmit={handleUpload} style={{ background: '#fff', border: '1px solid #e5e5e5', borderRadius: 16, padding: 20, boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 9, marginBottom: 16 }}>
              <Upload size={16} />
              <h2 style={{ fontSize: 15, fontWeight: 750, color: '#000' }}>Add a patent PDF</h2>
            </div>

            <label style={{ display: 'block', fontSize: 12, fontWeight: 650, color: '#525252', marginBottom: 6 }}>PDF file *</label>
            <input
              type="file"
              accept=".pdf,application/pdf"
              onChange={event => setFile(event.target.files?.[0] || null)}
              style={{ ...inputStyle, marginBottom: 14 }}
            />
            {file && <div style={{ marginTop: -8, marginBottom: 14, fontSize: 11, color: '#737373' }}>{file.name} · {(file.size / 1024 / 1024).toFixed(2)} MB</div>}

            <label style={{ display: 'block', fontSize: 12, fontWeight: 650, color: '#525252', marginBottom: 6 }}>Patent title</label>
            <input value={form.title} onChange={event => setForm(current => ({ ...current, title: event.target.value }))} placeholder="Defaults to PDF filename" style={{ ...inputStyle, marginBottom: 13 }} />

            <label style={{ display: 'block', fontSize: 12, fontWeight: 650, color: '#525252', marginBottom: 6 }}>Publication number</label>
            <input value={form.publication_number} onChange={event => setForm(current => ({ ...current, publication_number: event.target.value }))} placeholder="e.g. US1234567A1" style={{ ...inputStyle, marginBottom: 13 }} />

            <label style={{ display: 'block', fontSize: 12, fontWeight: 650, color: '#525252', marginBottom: 6 }}>Jurisdiction</label>
            <input value={form.jurisdiction} onChange={event => setForm(current => ({ ...current, jurisdiction: event.target.value }))} placeholder="e.g. US, EP, WO" style={{ ...inputStyle, marginBottom: 13 }} />

            <label style={{ display: 'block', fontSize: 12, fontWeight: 650, color: '#525252', marginBottom: 6 }}>Source URL</label>
            <input type="url" value={form.source_url} onChange={event => setForm(current => ({ ...current, source_url: event.target.value }))} placeholder="https://..." style={{ ...inputStyle, marginBottom: 16 }} />

            <button type="submit" disabled={uploading || !file} style={{
              width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
              padding: 11, border: 'none', borderRadius: 9,
              background: uploading || !file ? '#e5e5e5' : '#000',
              color: uploading || !file ? '#737373' : '#fff',
              fontSize: 13, fontWeight: 700, cursor: uploading || !file ? 'not-allowed' : 'pointer',
            }}>
              <Upload size={14} /> {uploading ? 'Indexing PDF...' : 'Upload and index'}
            </button>
          </form>

          <section style={{ background: '#fff', border: '1px solid #e5e5e5', borderRadius: 16, overflow: 'hidden', boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
            <div style={{ padding: '17px 20px', borderBottom: '1px solid #f5f5f5', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h2 style={{ fontSize: 15, fontWeight: 750, color: '#000' }}>Indexed patent documents</h2>
                <p style={{ fontSize: 12, color: '#a3a3a3', marginTop: 3 }}>{records.length} record{records.length === 1 ? '' : 's'} available for similarity search</p>
              </div>
              <Library size={17} color="#737373" />
            </div>

            {loading ? (
              <div style={{ padding: 22, color: '#737373', fontSize: 13 }}>Loading patent library...</div>
            ) : records.length === 0 ? (
              <div style={{ padding: '56px 24px', textAlign: 'center', color: '#737373' }}>
                <FileText size={28} color="#a3a3a3" style={{ marginBottom: 10 }} />
                <div style={{ fontSize: 14, fontWeight: 700, color: '#262626', marginBottom: 5 }}>No patents indexed yet</div>
                <div style={{ fontSize: 12 }}>Upload a readable PDF to start building the local corpus.</div>
              </div>
            ) : (
              records.map((record, index) => (
                <article key={record.id} style={{ padding: '16px 20px', borderTop: index === 0 ? 'none' : '1px solid #f5f5f5' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, alignItems: 'start' }}>
                    <div style={{ minWidth: 0 }}>
                      <h3 style={{ fontSize: 14, color: '#000', fontWeight: 700, overflowWrap: 'anywhere' }}>{record.title}</h3>
                      <div style={{ display: 'flex', gap: 7, flexWrap: 'wrap', marginTop: 7 }}>
                        {record.publication_number && <span style={{ fontSize: 11, color: '#404040', padding: '3px 7px', borderRadius: 6, background: '#f5f5f5' }}>{record.publication_number}</span>}
                        {record.jurisdiction && <span style={{ fontSize: 11, color: '#404040', padding: '3px 7px', borderRadius: 6, background: '#f5f5f5' }}>{record.jurisdiction}</span>}
                        <span style={{ fontSize: 11, color: '#737373', padding: '3px 7px', borderRadius: 6, background: '#fafafa' }}>{record.source}</span>
                      </div>
                      <div style={{ fontSize: 11, color: '#a3a3a3', marginTop: 8 }}>{record.filename} · {record.page_count} page{record.page_count === 1 ? '' : 's'} · Indexed {new Date(record.indexed_at).toLocaleDateString()}</div>
                    </div>
                    {record.source_url && (
                      <a href={record.source_url} target="_blank" rel="noreferrer" aria-label="Open patent source" style={{ color: '#525252', flexShrink: 0 }}>
                        <ExternalLink size={15} />
                      </a>
                    )}
                  </div>
                </article>
              ))
            )}
          </section>
        </div>
      </div>
    </div>
  )
}
