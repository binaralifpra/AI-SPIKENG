import { useState } from 'react'
import Dialog from './Dialog'

// "Edit Pesan" dialog from the Test/Training screens
export default function EditMessageDialog({ initialText, onCancel, onSubmit }) {
  const [text, setText] = useState(initialText)

  const submit = () => {
    const value = text.trim()
    if (value) onSubmit(value)
    else onCancel()
  }

  return (
    <Dialog
      title="Edit Pesan"
      onClose={onCancel}
      actions={
        <>
          <button className="btn-text" onClick={onCancel}>Batal</button>
          <button className="btn-primary btn-inline" onClick={submit}>Kirim Ulang</button>
        </>
      }
    >
      <textarea
        className="input"
        autoFocus
        rows={5}
        value={text}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={(e) => { if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) submit() }}
      />
    </Dialog>
  )
}
