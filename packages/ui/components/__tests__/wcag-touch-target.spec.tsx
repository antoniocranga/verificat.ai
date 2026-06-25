import { render } from '@testing-library/react';
import { ButtonPrimary } from '../button-primary';
import { ButtonSecondary } from '../button-secondary';
import { ButtonIconCircular } from '../button-icon-circular';
import { NavLink } from '../nav-link';

const WCAG_MIN_HEIGHT = 44;

function getStyle(el: Element): CSSStyleDeclaration {
  return (el as HTMLElement).style;
}

describe('WCAG 2.1 AA touch targets (44px min height)', () => {
  it('ButtonPrimary meets 44px', () => {
    const { container } = render(<ButtonPrimary>Verifică</ButtonPrimary>);
    const btn = container.querySelector('button')!;
    expect(getStyle(btn).height).toBe(`${WCAG_MIN_HEIGHT}px`);
  });

  it('ButtonSecondary meets 44px', () => {
    const { container } = render(<ButtonSecondary>Anulează</ButtonSecondary>);
    const btn = container.querySelector('button')!;
    expect(getStyle(btn).height).toBe(`${WCAG_MIN_HEIGHT}px`);
  });

  it('ButtonIconCircular meets 44px', () => {
    const { container } = render(<ButtonIconCircular>→</ButtonIconCircular>);
    const btn = container.querySelector('button')!;
    const s = getStyle(btn);
    expect(parseInt(s.height, 10)).toBeGreaterThanOrEqual(WCAG_MIN_HEIGHT);
    expect(parseInt(s.width, 10)).toBeGreaterThanOrEqual(WCAG_MIN_HEIGHT);
  });

  it('NavLink meets 44px', () => {
    const { container } = render(<NavLink>Acasă</NavLink>);
    const el = container.querySelector('button,a')!;
    expect(getStyle(el).height).toBe(`${WCAG_MIN_HEIGHT}px`);
  });
});
