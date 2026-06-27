import { render } from '@testing-library/react';
import { HeroBand } from '../hero-band';

describe('HeroBand', () => {
  it('renders children', () => {
    const { container } = render(<HeroBand><h1>Verifică</h1></HeroBand>);
    expect(container.textContent).toBe('Verifică');
  });
});
