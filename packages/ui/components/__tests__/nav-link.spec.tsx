import { render } from '@testing-library/react';
import { NavLink } from '../nav-link';

describe('NavLink', () => {
  it('renders children', () => {
    const { container } = render(<NavLink>Acasă</NavLink>);
    expect(container.textContent).toBe('Acasă');
  });

  it('renders as anchor when href given', () => {
    const { container } = render(<NavLink href="/cum-functioneaza">Cum funcționează</NavLink>);
    const link = container.querySelector('a');
    expect(link?.getAttribute('href')).toBe('/cum-functioneaza');
  });

  it('renders active state', () => {
    const { container } = render(<NavLink active>Activ</NavLink>);
    expect(container.textContent).toBe('Activ');
  });
});
