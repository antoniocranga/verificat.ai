import { render } from '@testing-library/react';
import { ButtonIconCircular } from '../button-icon-circular';

describe('ButtonIconCircular', () => {
  it('renders children', () => {
    const { container } = render(<ButtonIconCircular>→</ButtonIconCircular>);
    expect(container.textContent).toBe('→');
  });
});
