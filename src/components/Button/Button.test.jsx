import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, test, vi } from 'vitest';
import Button from './Button';

describe('Button', () => {
  test('renders successfully with its default label', () => {
    render(<Button />);

    expect(screen.getByRole('button', { name: /button/i })).toBeInTheDocument();
  });

  test('renders children correctly', () => {
    render(<Button>Save expense</Button>);

    expect(screen.getByRole('button', { name: /save expense/i })).toBeInTheDocument();
  });

  test('invokes onClick when enabled', async () => {
    const user = userEvent.setup();
    const handleClick = vi.fn();

    render(<Button onClick={handleClick}>Continue</Button>);
    await user.click(screen.getByRole('button', { name: /continue/i }));

    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  test('does not invoke onClick when disabled', async () => {
    const user = userEvent.setup();
    const handleClick = vi.fn();

    render(<Button onClick={handleClick} disabled>Continue</Button>);
    await user.click(screen.getByRole('button', { name: /continue/i }));

    expect(handleClick).not.toHaveBeenCalled();
  });

  test('applies custom props and class names', () => {
    render(<Button className="custom-button" data-testid="submit-button" />);

    const button = screen.getByTestId('submit-button');

    expect(button).toHaveClass('custom-button');
    expect(button).toHaveAttribute('data-testid', 'submit-button');
  });
});
