import { render } from '@testing-library/react';
import { DisplayXL, HeadingLg, HeadingMd, LabelSm, BodyLg, BodyMd, BodySm, MonoEyebrow } from '../typography';

describe('Typography primitives', () => {
  it('DisplayXL renders', () => {
    const { container } = render(<DisplayXL>Display</DisplayXL>);
    expect(container.textContent).toBe('Display');
  });

  it('HeadingLg renders', () => {
    const { container } = render(<HeadingLg>Heading</HeadingLg>);
    expect(container.textContent).toBe('Heading');
  });

  it('HeadingMd renders', () => {
    const { container } = render(<HeadingMd>Heading Mediu</HeadingMd>);
    expect(container.textContent).toBe('Heading Mediu');
  });

  it('LabelSm renders', () => {
    const { container } = render(<LabelSm>Etichetă</LabelSm>);
    expect(container.textContent).toBe('Etichetă');
  });

  it('BodyLg renders', () => {
    const { container } = render(<BodyLg>Corp mare</BodyLg>);
    expect(container.textContent).toBe('Corp mare');
  });

  it('BodyMd renders', () => {
    const { container } = render(<BodyMd>Corp mediu</BodyMd>);
    expect(container.textContent).toBe('Corp mediu');
  });

  it('BodySm renders', () => {
    const { container } = render(<BodySm>Corp mic</BodySm>);
    expect(container.textContent).toBe('Corp mic');
  });

  it('MonoEyebrow renders uppercase text', () => {
    const { container } = render(<MonoEyebrow>secțiune</MonoEyebrow>);
    expect(container.textContent).toBe('secțiune');
  });

  it('MonoEyebrow applies uppercase text-transform', () => {
    const { container } = render(<MonoEyebrow>secțiune</MonoEyebrow>);
    const el = container.querySelector('span') as HTMLElement;
    expect(el.style.textTransform).toBe('uppercase');
  });

  it('DisplayXL has correct letter-spacing', () => {
    const { container } = render(<DisplayXL>Test</DisplayXL>);
    const el = container.querySelector('h1')!;
    // Updated to em-based value matching --letter-spacing-display-xl token
    expect(el.style.letterSpacing).toBe('-0.04em');
  });
});
