import React, { useState, useEffect } from 'react'
import { useDropzone } from 'react-dropzone'
import toast from 'react-hot-toast'
import { Upload, FileText, Trash2, ChevronRight, Loader2 } from 'lucide-react'
import { uploadDocument, listDocuments, deleteDocument } from '../utils/api'

export default function UploadPage() {
  const [docs, setDocs] = useState([])
  const [uploading, setUploading] = useState(false)

  const fetchDocs = () => listDocuments().then(setDocs).catch(console.error)
  useEffect(() => { fetchDocs() }, [])

  const onDrop = async (files) => {
    for (const file of files) {
      setUploading(true)
      const toastId = toast.loading(`Uploading ${file.name}...`)
      try {
        const result = await uploadDocument(file)
        toast.success(`"${result.title}" uploaded — ${result.subject}`, { id: toastId })
        fetchDocs()
      } catch (e) {
        toast.error(e.message, { id: toastId })
      } finally {
        setUploading(false)
      }
    }
  }

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop, accept: { 'application/pdf': ['.pdf'], 'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'], 'text/plain': ['.txt'], 'text/markdown': ['.md'] },
    disabled: uploading
  })

  const handleDelete = async (id, title) => {
    if (!confirm(`Delete "${title}"?`)) return
    try {
      await deleteDocument(id)
      toast.success('Document deleted')
      fetchDocs()
    } catch (e) { toast.error(e.message) }
  }

  const subjectColors = { Mathematics: 'text-blue-400', Physics: 'text-purple-400', Chemistry: 'text-green-400', Biology: 'text-emerald-400', History: 'text-amber-400', 'Computer Science': 'text-cyan-400', General: 'text-white/40' }

  return (
    <div className="space-y-8 animate-fade-up">
      <div>
        <h2 className="font-display text-3xl font-bold text-white">Documents</h2>
        <p className="text-white/40 mt-1">Upload your study materials to get started</p>
      </div>

      {/* Dropzone */}
      <div {...getRootProps()}
        className={`glass rounded-2xl p-12 border-2 border-dashed transition-all cursor-pointer text-center
          ${isDragActive ? 'border-amber-400/60 bg-amber-400/5' : 'border-white/10 hover:border-white/20 hover:bg-white/2'}`}>
        <input {...getInputProps()} />
        <div className="flex flex-col items-center gap-4">
          {uploading ? (
            <Loader2 size={40} className="text-amber-400 animate-spin" />
          ) : (
            <div className={`w-16 h-16 rounded-2xl flex items-center justify-center transition-all ${isDragActive ? 'bg-amber-400/20' : 'bg-white/5'}`}>
              <Upload size={28} className={isDragActive ? 'text-amber-400' : 'text-white/40'} />
            </div>
          )}
          <div>
            <p className="text-white font-medium">{isDragActive ? 'Drop files here' : uploading ? 'Processing...' : 'Drop files or click to upload'}</p>
            <p className="text-white/30 text-sm mt-1">PDF, DOCX, TXT, MD — up to 20MB</p>
          </div>
        </div>
      </div>

      {/* Document list */}
      {docs.length > 0 && (
        <div className="space-y-3">
          <h3 className="font-display text-lg font-semibold text-white">Your Documents ({docs.length})</h3>
          {docs.map(doc => (
            <div key={doc.id} className="glass rounded-xl p-4 flex items-center gap-4 card-hover group">
              <div className="w-10 h-10 rounded-xl bg-amber-400/10 flex items-center justify-center shrink-0">
                <FileText size={18} className="text-amber-400" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-white font-medium truncate">{doc.title}</p>
                <div className="flex items-center gap-3 mt-0.5">
                  <span className={`text-xs font-medium ${subjectColors[doc.subject] || 'text-white/40'}`}>{doc.subject}</span>
                  <span className="text-white/20 text-xs">·</span>
                  <span className="text-white/30 text-xs">{doc.word_count?.toLocaleString()} words</span>
                  <span className="text-white/20 text-xs">·</span>
                  <span className="text-white/30 text-xs">{new Date(doc.created_at).toLocaleDateString()}</span>
                </div>
              </div>
              <button onClick={() => handleDelete(doc.id, doc.title)}
                className="opacity-0 group-hover:opacity-100 p-2 rounded-lg hover:bg-rose-500/10 transition-all text-white/30 hover:text-rose-400">
                <Trash2 size={16} />
              </button>
            </div>
          ))}
        </div>
      )}

      {docs.length === 0 && !uploading && (
        <div className="text-center py-12 text-white/20">
          <FileText size={40} className="mx-auto mb-3 opacity-30" />
          <p>No documents yet. Upload your first study material!</p>
        </div>
      )}
    </div>
  )
}
