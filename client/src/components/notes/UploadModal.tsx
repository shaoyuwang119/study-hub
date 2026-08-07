import { useState } from 'react'

import { faXmark } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'

type UploadModalProps = {
  open: boolean
  onSubmit: (data: {
    title: string
    subject: string
    description: string
    files: File[]
    author: string
  }) => void
  onClose: () => void
}

function UploadModal({ open, onClose, onSubmit }: UploadModalProps) {
  if (!open) return null

  const [title, setTitle] = useState('')
  const [subject, setSubject] = useState('')
  const [description, setDescription] = useState('')
  const [files, setFiles] = useState<File[] | null>(null)

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

            if (!files) {
              alert('Please select a file.')
              return
            }

            // if (!title || !subject || !description) {
            //   alert('Please fill in all fields.')
            //   return
            // }

            onSubmit({
              title,
              subject,
              description,
              files: files,
              author: 'Anonymous', // todo: replace with actual author in public profiles table
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
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Description"
            className="rounded-lg border border-gray-200 p-2 focus:border-gray-300 focus:outline-none"
          />

          <input
            id="fileInput"
            type="file"
            accept=".pdf,.png,.jpg,.jpeg.,.heic"
            multiple
            onChange={(e) => {
              const selected = Array.from(e.target.files ?? [])
              if (selected.length > 0) setFiles([...(files || []), ...selected])
              e.target.value = ''
            }}
            className="hidden"
          />
          <label
            htmlFor="fileInput"
            className="flex h-25 cursor-pointer items-center justify-center rounded-lg border-2 border-dashed border-gray-300 px-4 py-2 text-gray-500 hover:bg-gray-100"
          >
            Choose File(s)
          </label>

          {files?.map((file, index) => (
            <div key={index} className="flex items-center justify-between">
              <p className="text-sm text-gray-700">{file.name}</p>
            </div>
          ))}

          {/* {files && (
            <p className="text-xs text-zinc-500">Selected: {files.name}</p>
          )} */}

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
