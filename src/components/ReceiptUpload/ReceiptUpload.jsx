import { useRef, useEffect, useState } from 'react';
import { Upload, Receipt, CircleAlert } from 'lucide-react';
import './ReceiptUpload.css';

/**
 * Receipt upload field for a single expense entry.
 * Accepts image files only, shows a thumbnail preview and the filename.
 * File objects are surfaced to the parent — no upload or API calls are made.
 *
 * Object URLs are created locally for preview and revoked on unmount or
 * when the file changes to prevent memory leaks.
 *
 * @param {object}        props
 * @param {string}        props.id            - Unique id for the hidden file input (accessibility).
 * @param {File|null}     props.file          - Controlled file value (null when empty).
 * @param {Function}      props.onChange      - Called with the selected File when a file is chosen.
 * @param {Function}      props.onRemove      - Called with no arguments when the file is cleared.
 * @param {string}        [props.error]       - Inline validation error message.
 */
const ReceiptUpload = ({ id, file, onChange, onRemove, error }) => {
  const inputRef = useRef(null);
  const [previewUrl, setPreviewUrl] = useState(null);

  /* Create / revoke object URL whenever the file prop changes */
  useEffect(() => {
    if (!file) {
      setPreviewUrl(null);
      return;
    }

    const url = URL.createObjectURL(file);
    setPreviewUrl(url);

    return () => {
      URL.revokeObjectURL(url);
    };
  }, [file]);

  const handleInputChange = (e) => {
    const selected = e.target.files?.[0];
    if (selected) {
      onChange(selected);
    }
    /* Reset so the same file can be re-selected after removal */
    e.target.value = '';
  };

  const handleRemove = () => {
    onRemove();
  };

  return (
    <div className="receipt-upload">
      <span className="receipt-upload__label">Receipt</span>

      {/* Hidden native file input */}
      <input
        ref={inputRef}
        id={id}
        type="file"
        accept="image/*"
        className="receipt-upload__input"
        aria-label="Upload receipt image"
        aria-describedby={error ? `${id}-error` : undefined}
        onChange={handleInputChange}
      />

      {file && previewUrl ? (
        /* ── Preview state ── */
        <div className="receipt-upload__preview">
          <img
            src={previewUrl}
            alt={`Receipt preview for ${file.name}`}
            className="receipt-upload__image"
          />
          <div className="receipt-upload__meta">
            <Receipt size={14} className="receipt-upload__file-icon" aria-hidden="true" />
            <span className="receipt-upload__filename" title={file.name}>
              {file.name}
            </span>
            <label
              htmlFor={id}
              className="receipt-upload__replace"
              role="button"
              tabIndex={0}
              onKeyDown={(e) => e.key === 'Enter' && inputRef.current?.click()}
            >
              Replace
            </label>
            <button
              type="button"
              className="receipt-upload__remove"
              onClick={handleRemove}
              aria-label="Remove receipt"
            >
              Remove
            </button>
          </div>
        </div>
      ) : (
        /* ── Empty state ── */
        <label
          htmlFor={id}
          className={`receipt-upload__dropzone${error ? ' receipt-upload__dropzone--error' : ''}`}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => e.key === 'Enter' && inputRef.current?.click()}
        >
          <Upload size={20} className="receipt-upload__dropzone-icon" aria-hidden="true" />
          <span className="receipt-upload__dropzone-text">Upload Receipt</span>
          <span className="receipt-upload__dropzone-hint">PNG, JPG, WEBP</span>
        </label>
      )}

      {error && (
        <span id={`${id}-error`} className="receipt-upload__error" role="alert">
          <CircleAlert size={12} aria-hidden="true" />
          {error}
        </span>
      )}
    </div>
  );
};

export default ReceiptUpload;
