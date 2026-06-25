import { render } from '@testing-library/react';
import { CodeBlock } from '../code-block';

describe('CodeBlock', () => {
  it('renders code content', () => {
    const { container } = render(<CodeBlock>{'const x = 1;'}</CodeBlock>);
    expect(container.textContent).toBe('const x = 1;');
  });
});
