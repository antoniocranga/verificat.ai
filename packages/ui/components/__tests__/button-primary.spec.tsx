import { render } from '@testing-library/react';
import { ButtonPrimary } from '../button-primary';

describe('ButtonPrimary', () => {
  it('renders children text', () => {
    const { container } = render(<ButtonPrimary>Verifică</ButtonPrimary>);
    expect(container.textContent).toBe('Verifică');
  });

  it('renders with correct test id', () => {
    const { container } = render(<ButtonPrimary id="cta-verify">Click</ButtonPrimary>);
    expect(container.querySelector('#cta-verify')).toBeTruthy();
  });
});
