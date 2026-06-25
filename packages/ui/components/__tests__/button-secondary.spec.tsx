import { render } from '@testing-library/react';
import { ButtonSecondary } from '../button-secondary';

describe('ButtonSecondary', () => {
  it('renders children text', () => {
    const { container } = render(<ButtonSecondary>Anulează</ButtonSecondary>);
    expect(container.textContent).toBe('Anulează');
  });
});
