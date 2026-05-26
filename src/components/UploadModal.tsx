import { useState } from 'react'

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faXmark } from '@fortawesome/free-solid-svg-icons'

type UploadModalProps = {
  open: boolean
  onSubmit: (data: {
    title: string
    subject: string
    description: string
    url: string
    author: string
  }) => void
  onClose: () => void
}

function UploadModal({ open, onClose, onSubmit }: UploadModalProps) {
  if (!open) return null

  const [title, setTitle] = useState('')
  const [subject, setSubject] = useState('')
  const [description, setDescription] = useState('')
  const [url, setUrl] = useState('')

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/50">
      <div className="w-125 rounded-2xl bg-white p-6 shadow-xl">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-zinc-800">Upload Notes</h2>
          <button
            onClick={onClose}
            className="cursor-pointer text-xl text-gray-500 hover:text-black"
          >
            <FontAwesomeIcon icon={faXmark} />
          </button>
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault()

            onSubmit({
              title,
              subject,
              description,
              url,
              author: 'John D',
            })
            onClose()
          }}
          className="flex flex-col gap-4"
        >
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Title"
            className="rounded-lg border border-gray-200 p-2 focus:border-gray-300 focus:outline-none"
          />
          <input
            type="text"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            placeholder="Subject"
            className="rounded-lg border border-gray-200 p-2 focus:border-gray-300 focus:outline-none"
          />
          <input
            type="text"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="Url"
            className="rounded-lg border border-gray-200 p-2 focus:border-gray-300 focus:outline-none"
          />

          <button
            type="submit"
            className="cursor-pointer rounded-lg bg-blue-500 p-3 text-white transition hover:bg-blue-600"
          >
            Submit
          </button>
        </form>
      </div>
    </div>
  )
}

export default UploadModal
