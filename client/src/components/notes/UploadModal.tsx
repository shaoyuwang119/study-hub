import { useState } from 'react'

import { useSubjects } from '@/lib/subjects'

import {
  faXmark,
  faFileLines,
  faFileImage,
  faCloudArrowUp,
  faSpinner,
} from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'

type UploadModalProps = {
  open: boolean
  onSubmit: (data: {
    title: string
    subject: string
    description: string
    files: File[]
  }) => Promise<void>
  onClose: () => void
}

function UploadModal({ open, onClose, onSubmit }: UploadModalProps) {
  const SUBJECTS = useSubjects()

  const [title, setTitle] = useState('')
  const [subject, setSubject] = useState('')
  const [description, setDescription] = useState('')
  const [files, setFiles] = useState<File[]>([])
  const [uploadType, setUploadType] = useState<'pdf' | 'images'>('pdf')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)

  if (!open) return null

  const resetState = () => {
    setTitle('')
    setSubject('')
    setDescription('')
    setFiles([])
    setUploadType('pdf')
    setIsSubmitting(false)
    setSubmitError(null)
  }

  const handleClose = () => {
    resetState()
    onClose()
  }

  const removeFile = (index: number) => {
    setFiles((prev) => prev?.filter((_, i) => i !== index) ?? null)
  }

  return (
    <div className="fixed inset-0 z-30 flex items-center justify-center bg-black/50">
      <div className="w-200 rounded-2xl bg-zinc-100 p-6 shadow-xl">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-zinc-800">Upload Notes</h2>
          <button
            onClick={handleClose}
            disabled={isSubmitting}
            className="cursor-pointer text-xl text-gray-500 hover:text-black disabled:cursor-not-allowed disabled:opacity-40"
          >
            <FontAwesomeIcon icon={faXmark} />
          </button>
        </div>

        <form
          onSubmit={async (e) => {
            e.preventDefault()

            if (!title || !subject) {
              alert('Please fill in all required fields.')
              return
            }

            if (files.length === 0) {
              alert('Please select a file.')
              return
            }

            setIsSubmitting(true)
            setSubmitError(null)
            try {
              await onSubmit({
                title,
                subject,
                description,
                files,
              })
              resetState()
              onClose()
            } catch (err) {
              setSubmitError(
                err instanceof Error ? err.message : 'Failed to upload note.'
              )
            } finally {
              setIsSubmitting(false)
            }
          }}
          className="flex gap-6"
        >
          {/* Left column: files */}
          <div className="flex w-1/2 flex-col gap-3">
            <div className="flex items-center">
              <div className="mr-2 text-zinc-700">Upload Type:</div>
              <select
                value={uploadType}
                onChange={(e) => {
                  setUploadType(e.target.value as 'pdf' | 'images')
                  setFiles([])
                }}
                className="flex-1 rounded-lg border border-gray-300 p-2 text-gray-700 focus:border-gray-300 focus:outline-none"
              >
                <option value="pdf">PDF</option>
                <option value="images">Images</option>
              </select>
            </div>
            <input
              id="fileInput"
              type="file"
              accept={
                uploadType === 'pdf'
                  ? '.pdf'
                  : '.png,.jpg,.jpeg,.webp,.svg,.heic'
              }
              multiple={uploadType === 'images'}
              onChange={(e) => {
                const selected = Array.from(e.target.files ?? [])
                if (selected.length == 0) return

                if (uploadType === 'pdf') {
                  setFiles([selected[0]]) // only allow one PDF
                } else {
                  setFiles((prev) => [...prev, ...selected])
                }
                e.target.value = '' // allow re-picking the same filename
              }}
              className="hidden"
            />
            <label
              htmlFor="fileInput"
              className="flex h-28 cursor-pointer flex-col items-center rounded-lg border-2 border-dashed border-gray-300 px-4 py-2 text-gray-500 hover:bg-gray-100"
            >
              <div className="mt-5">
                <FontAwesomeIcon icon={faCloudArrowUp} className="mr-2" />
                Upload {uploadType === 'pdf' ? 'PDF' : 'Images'}
              </div>
              <div className="mt-auto text-center text-xs text-zinc-400">
                Supported formats:{' '}
                {uploadType === 'pdf'
                  ? 'PDF'
                  : 'PNG, JPG, JPEG, WEBP, SVG, HEIC'}
                . Max {uploadType === 'pdf' ? '1 file' : '20 files'}. Max size
                50MB total.
              </div>
            </label>
            <div className="flex max-h-40 flex-col overflow-y-auto">
              {files.map((file, index) => (
                <div
                  key={`${file.name}-${index}`}
                  className="flex items-center border-b border-gray-300 py-2"
                >
                  <FontAwesomeIcon
                    key={`${file.name}-${index}`}
                    icon={
                      file.type.startsWith('image/') ? faFileImage : faFileLines
                    }
                    className="mr-2 text-zinc-400"
                  />
                  <p className="truncate text-sm text-gray-700">{file.name}</p>
                  <button
                    type="button"
                    onClick={() => removeFile(index)}
                    className="ml-auto cursor-pointer px-2 text-zinc-400 hover:text-red-500"
                  >
                    <FontAwesomeIcon icon={faXmark} />
                  </button>
                </div>
              ))}
            </div>
            <p className="h-0 pb-1 text-xs text-gray-500">
              {files.length === 0
                ? 'No files selected yet!'
                : `${files.length} file${files.length === 1 ? '' : 's'} selected`}
            </p>
          </div>

          {/* Right column: metadata */}
          <div className="flex h-90 w-1/2 flex-col gap-3">
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Title (required)"
              className="rounded-lg border border-gray-300 px-3 py-2 font-medium text-zinc-800 placeholder:font-normal placeholder:text-zinc-400 focus:border-gray-300 focus:outline-none"
            />

            <select
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className={`rounded-lg border border-gray-300 px-2 py-2 focus:border-gray-300 focus:outline-none ${subject === '' ? 'text-zinc-400' : 'text-zinc-800'}`}
            >
              <option value="" disabled>
                Subject (required)
              </option>
              {SUBJECTS.map((s) => (
                <option key={s} value={s} className="text-zinc-700">
                  {s}
                </option>
              ))}
            </select>

            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Description"
              className="flex-1 resize-none rounded-lg border border-gray-300 px-3 py-2 text-zinc-800 placeholder:text-zinc-400 focus:border-gray-300 focus:outline-none"
            />
            {submitError && (
              <p className="text-xs text-red-500">{submitError}</p>
            )}
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex cursor-pointer items-center justify-center gap-2 rounded-lg bg-blue-500 p-3 text-white transition hover:bg-blue-600 disabled:cursor-not-allowed disabled:bg-blue-300"
            >
              {isSubmitting ? (
                <>
                  <FontAwesomeIcon icon={faSpinner} spinPulse />
                  Submitting...
                </>
              ) : (
                'Submit'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default UploadModal
