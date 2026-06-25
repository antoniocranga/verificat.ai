import { render } from '@testing-library/react';
import { FooterBand } from '../footer-band';

describe('FooterBand', () => {
  it('renders children', () => {
    const { container } = render(<FooterBand><span>2026</span></FooterBand>);
    expect(container.textContent).toBe('2026');
  });
});
