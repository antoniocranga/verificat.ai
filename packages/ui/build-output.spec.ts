import { existsSync } from 'fs';
import { resolve } from 'path';

const dist = resolve(__dirname, 'dist');

describe('Build output', () => {
  it('dist directory exists', () => {
    expect(existsSync(dist)).toBe(true);
  });

  it('dist/index.js exists', () => {
    expect(existsSync(resolve(dist, 'index.js'))).toBe(true);
  });

  it('dist/components/button.css exists', () => {
    expect(existsSync(resolve(dist, 'components', 'button.css'))).toBe(true);
  });

  it('dist/components/input.css exists', () => {
    expect(existsSync(resolve(dist, 'components', 'input.css'))).toBe(true);
  });

  it('tokens.css at package root exists', () => {
    expect(existsSync(resolve(__dirname, 'tokens.css'))).toBe(true);
  });
});
