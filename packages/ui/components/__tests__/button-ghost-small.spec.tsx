import { render } from '@testing-library/react';
import { ButtonGhostSmall } from '../button-ghost-small';

describe('ButtonGhostSmall', () => {
  it('renders children text', () => {
    const { container } = render(<ButtonGhostSmall>Istoric</ButtonGhostSmall>);
    expect(container.textContent).toBe('Istoric');
  });
});
