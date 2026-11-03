import { ImageUp, LoaderCircle, X } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'

import { uploadPromptImage } from '../../lib/promptsApi.js'
import Button from './Button.jsx'

const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/avif']
const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024

function ImageUploadField({ value = '', onChange, label = 'Image', placeholder = 'https://example.com/image.webp', required = false, allowManualUrl = true }) {
  const fileInputRef = useRef(null)
  const [localUrl, setLocalUrl] = useState(value)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')
  const [previewUrl, setPreviewUrl] = useState(value)

  useEffect(() => {
    setLocalUrl(value)
    setPreviewUrl(value)
  }, [value])

  useEffect(() => {
    return () => {
      if (previewUrl && previewUrl.startsWith('blob:')) {
        URL.revokeObjectURL(previewUrl)
      }
    }
  }, [previewUrl])

  const handleManualChange = (event) => {
    const nextValue = event.target.value
    setLocalUrl(nextValue)
    setPreviewUrl(nextValue)
    setError('')
    onChange(nextValue)
  }

  const handleUpload = async (event) => {
    const file = event.target.files?.[0]

    if (!file) {
      return
    }

    const isValidType = ALLOWED_TYPES.includes(file.type)
    const isValidSize = file.size <= MAX_FILE_SIZE_BYTES

    if (!isValidType) {
      setError('Only JPEG, PNG, WebP, and AVIF images are supported.')
      event.target.value = ''
      return
    }

    if (!isValidSize) {
      setError('Image must be 5 MB or smaller.')
      event.target.value = ''
      return
    }

    setUploading(true)
    setError('')

    const objectUrl = URL.createObjectURL(file)
    setPreviewUrl(objectUrl)

    try {
      const result = await uploadPromptImage(file)
      const secureUrl = result?.secureUrl || result?.data?.secureUrl || ''

      if (!secureUrl) {
        throw new Error('Upload completed but no image URL was returned.')
      }

      setLocalUrl(secureUrl)
      setPreviewUrl(secureUrl)
      onChange(secureUrl)
    } catch (uploadError) {
      setPreviewUrl(value)
      setError(uploadError?.message || 'Image upload failed. Please try again.')
    } finally {
      setUploading(false)
      event.target.value = ''
    }
  }

  const clearValue = () => {
    setLocalUrl('')
    setPreviewUrl('')
    onChange('')
    setError('')
  }

  const inputId = `image-upload-${label.toLowerCase().replace(/\s+/g, '-')}`

  return (
    <div className="block text-xs font-medium uppercase tracking-[0.14em] text-[var(--text-muted)]">
      <div className="mb-2 flex items-center justify-between gap-3">
        <label htmlFor={inputId} className="cursor-pointer text-[inherit]">
          {label}
          {required ? <span className="ml-1 text-[var(--accent)]">*</span> : null}
        </label>
        {value || localUrl ? (
          <button
            type="button"
            onClick={clearValue}
            className="inline-flex items-center gap-1 rounded-full border border-[var(--border)] bg-[var(--surface)] px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-[var(--text)] transition-colors hover:border-[var(--focus)]"
          >
            <X className="size-3" aria-hidden="true" />
            Clear
          </button>
        ) : null}
      </div>

      {previewUrl ? (
        <div className="mb-3 overflow-hidden rounded-[18px] border border-[var(--border)] bg-[var(--surface-muted)] p-2">
          <img src={previewUrl} alt="Selected prompt preview" className="h-28 w-full rounded-[12px] object-cover" />
        </div>
      ) : null}

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/avif"
          onChange={handleUpload}
          className="hidden"
          aria-label="Upload image file"
        />
        <Button
          type="button"
          variant="secondary"
          size="sm"
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
          className="w-full sm:w-auto"
        >
          {uploading ? (
            <>
              <LoaderCircle className="mr-2 size-4 animate-spin" aria-hidden="true" />
              Uploading...
            </>
          ) : (
            <>
              <ImageUp className="mr-2 size-4" aria-hidden="true" />
              Upload Image
            </>
          )}
        </Button>
      </div>

      {allowManualUrl ? (
        <div className="mt-3">
          <input
            id={inputId}
            type="text"
            value={localUrl}
            onChange={handleManualChange}
            placeholder={placeholder}
            className="w-full rounded-[14px] border border-[var(--border)] bg-[var(--surface-muted)] px-3 py-2.5 text-sm text-[var(--text)] outline-none focus:border-[var(--focus)]"
          />
        </div>
      ) : null}

      <p className="mt-2 text-[10px] font-medium uppercase tracking-[0.12em] text-[var(--text-muted)]">
        Accepted formats: JPG, PNG, WebP, AVIF · Max size: 5 MB
      </p>

      {error ? <p className="mt-2 text-xs text-red-600">{error}</p> : null}
    </div>
  )
}

export default ImageUploadField
