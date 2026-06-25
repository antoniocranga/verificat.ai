import { render } from '@testing-library/react';
import { TextInput } from '../text-input';

describe('TextInput', () => {
  it('renders with placeholder', () => {
    const { container } = render(<TextInput placeholder="Caută..." />);
    const input = container.querySelector('input')!;
    expect(input.placeholder).toBe('Caută...');
  });

  it('renders with defaultValue', () => {
    const { container } = render(<TextInput defaultValue="test" />);
    const input = container.querySelector('input')!;
    expect(input.value).toBe('test');
  });
});
