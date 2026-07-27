import { fireEvent, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, test, vi } from 'vitest';
import ReceiptUpload from './ReceiptUpload';
import { renderReceiptUpload } from '../../tests/factories/renderReceiptUpload';

const createFile = (name, type = 'image/png') => new File(['test'], name, { type });

describe('ReceiptUpload', () => {
  test('renders successfully and exposes the upload input', () => {
    renderReceiptUpload();

    expect(screen.getByText('Receipt')).toBeInTheDocument();
    expect(screen.getByLabelText(/upload receipt image/i)).toBeInTheDocument();
    expect(screen.getByText('Upload Receipt')).toBeInTheDocument();
  });

  test('calls onChange when a valid file is selected', async () => {
    const user = userEvent.setup();
    const { props } = renderReceiptUpload();

    await user.upload(screen.getByLabelText(/upload receipt image/i), createFile('receipt.png'));

    expect(props.onChange).toHaveBeenCalledWith(createFile('receipt.png'));
  });

  test('shows the uploaded file name and preview when a file is provided', () => {
    const file = createFile('receipt.png');
    renderReceiptUpload({ file });

    expect(screen.getByAltText(/receipt preview for receipt\.png/i)).toBeInTheDocument();
    expect(screen.getByText('receipt.png')).toBeInTheDocument();
    expect(screen.getByText('Replace')).toBeInTheDocument();
  });

  test('updates the preview and displayed name when a replacement file is selected', () => {
    const firstFile = createFile('first.png');
    const secondFile = createFile('second.png');
    const { rerender } = renderReceiptUpload({ file: firstFile });

    expect(screen.getByText('first.png')).toBeInTheDocument();

    rerender(
      <ReceiptUpload id="receipt-upload" file={secondFile} onChange={vi.fn()} onRemove={vi.fn()} />,
    );

    expect(screen.getByAltText(/receipt preview for second\.png/i)).toBeInTheDocument();
    expect(screen.getByText('second.png')).toBeInTheDocument();
    expect(screen.queryByText('first.png')).not.toBeInTheDocument();
  });

  test('calls onRemove when the uploaded file is removed', async () => {
    const user = userEvent.setup();
    const { props } = renderReceiptUpload({ file: createFile('receipt.png') });

    await user.click(screen.getByRole('button', { name: /remove receipt/i }));

    expect(props.onRemove).toHaveBeenCalledTimes(1);
  });

  test('does not call onChange when no file is selected', () => {
    const { props } = renderReceiptUpload();

    fireEvent.change(screen.getByLabelText(/upload receipt image/i), { target: { files: [] } });

    expect(props.onChange).not.toHaveBeenCalled();
  });

  test('renders the inline error state when an error is provided', () => {
    renderReceiptUpload({ error: 'A receipt image is required.' });

    expect(screen.getByRole('alert')).toHaveTextContent('A receipt image is required.');
    expect(screen.getByLabelText(/upload receipt image/i)).toHaveAccessibleDescription(
      'A receipt image is required.',
    );
  });

  test('activates the replace action with Enter key', () => {
    const clickSpy = vi.spyOn(HTMLInputElement.prototype, 'click');
    renderReceiptUpload({ file: createFile('receipt.png') });

    fireEvent.keyDown(screen.getByText('Replace'), { key: 'Enter' });

    expect(clickSpy).toHaveBeenCalled();
    clickSpy.mockRestore();
  });

  test('activates the dropzone with Enter key when no file is present', () => {
    const clickSpy = vi.spyOn(HTMLInputElement.prototype, 'click');
    renderReceiptUpload();

    fireEvent.keyDown(screen.getByRole('button', { name: /upload receipt/i }), { key: 'Enter' });

    expect(clickSpy).toHaveBeenCalled();
    clickSpy.mockRestore();
  });

  test('exposes image-only file selection through the input accept attribute', () => {
    renderReceiptUpload();

    expect(screen.getByLabelText(/upload receipt image/i)).toHaveAttribute('accept', 'image/*');
  });
});
