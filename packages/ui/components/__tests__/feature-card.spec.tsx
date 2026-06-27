import { render } from '@testing-library/react';
import { FeatureCard } from '../feature-card';

describe('FeatureCard', () => {
  it('renders children', () => {
    const { container } = render(
      <FeatureCard>
        <p>Conținut card</p>
      </FeatureCard>,
    );
    expect(container.textContent).toBe('Conținut card');
  });

  it('renders with shadow variant', () => {
    const { container } = render(
      <FeatureCard shadow>
        <p>Cu umbră</p>
      </FeatureCard>,
    );
    expect(container.textContent).toBe('Cu umbră');
  });
});
