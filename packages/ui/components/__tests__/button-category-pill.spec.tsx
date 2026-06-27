import { render } from '@testing-library/react';
import { ButtonCategoryPill } from '../button-category-pill';

describe('ButtonCategoryPill', () => {
  it('renders children', () => {
    const { container } = render(<ButtonCategoryPill>Toate</ButtonCategoryPill>);
    expect(container.textContent).toBe('Toate');
  });

  it('renders active state', () => {
    const { container } = render(<ButtonCategoryPill active>Active</ButtonCategoryPill>);
    expect(container.textContent).toBe('Active');
  });
});
