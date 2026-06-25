import { render } from '@testing-library/react';
import { LogoStrip } from '../logo-strip';

describe('LogoStrip', () => {
  it('renders children', () => {
    const { container } = render(<LogoStrip><span>Logo1</span><span>Logo2</span></LogoStrip>);
    expect(container.textContent).toBe('Logo1Logo2');
  });
});
