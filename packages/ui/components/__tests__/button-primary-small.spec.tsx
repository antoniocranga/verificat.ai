import { render } from '@testing-library/react';
import { ButtonPrimarySmall } from '../button-primary-small';

describe('ButtonPrimarySmall', () => {
  it('renders children text', () => {
    const { container } = render(<ButtonPrimarySmall>Start</ButtonPrimarySmall>);
    expect(container.textContent).toBe('Start');
  });
});
