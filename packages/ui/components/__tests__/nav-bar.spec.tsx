import { render } from '@testing-library/react';
import { NavBar } from '../nav-bar';

describe('NavBar', () => {
  it('renders children', () => {
    const { container } = render(<NavBar><span>Logo</span></NavBar>);
    expect(container.textContent).toBe('Logo');
  });
});
