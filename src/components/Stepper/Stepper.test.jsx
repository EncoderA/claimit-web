import { render, screen } from '@testing-library/react';
import { describe, expect, test } from 'vitest';
import Stepper from './Stepper';

describe('Stepper', () => {
  test('renders all steps provided as children', () => {
    render(
      <Stepper>
        <div>Step 1</div>
        <div>Step 2</div>
        <div>Step 3</div>
      </Stepper>,
    );

    expect(screen.getByText('Step 1')).toBeInTheDocument();
    expect(screen.getByText('Step 2')).toBeInTheDocument();
    expect(screen.getByText('Step 3')).toBeInTheDocument();
  });

  test('displays the current step correctly', () => {
    render(
      <Stepper>
        <div>Step 1</div>
        <div current-step="true">Step 2</div>
        <div>Step 3</div>
      </Stepper>,
    );

    expect(screen.getByText('Step 2')).toBeInTheDocument();
  });
});
