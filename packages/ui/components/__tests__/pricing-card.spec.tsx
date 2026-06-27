import { render } from '@testing-library/react';
import { PricingCard } from '../pricing-card';

describe('PricingCard', () => {
  it('renders children', () => {
    const { container } = render(
      <PricingCard>
        <p>Plan Premium</p>
      </PricingCard>,
    );
    expect(container.textContent).toBe('Plan Premium');
  });
});
