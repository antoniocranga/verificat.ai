import { render } from '@testing-library/react';
import { CTABand } from '../cta-band';

describe('CTABand', () => {
  it('renders children', () => {
    const { container } = render(<CTABand><button>Începe</button></CTABand>);
    expect(container.textContent).toBe('Începe');
  });
});
