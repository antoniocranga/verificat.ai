import { render } from '@testing-library/react';
import { NavBar } from '../nav-bar';

describe('NavBar', () => {
  it('renders logo when provided', () => {
    const { container } = render(<NavBar logo={<span>Logo</span>} />);
    expect(container.textContent).toBe('Logo');
  });
});
