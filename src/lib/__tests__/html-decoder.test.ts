import { decodeHtmlEntities, decodeHtmlInObject } from '../html-decoder';

// Mock de document para testing
global.document = {
  createElement: jest.fn(() => ({
    innerHTML: '',
    get value() {
      return this.innerHTML.replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&amp;/g, '&');
    }
  }))
} as any;

describe('HTML Decoder', () => {
  it('debería decodificar entidades HTML básicas', () => {
    const encoded = '&lt;div&gt;Hello&lt;/div&gt;';
    const decoded = decodeHtmlEntities(encoded);
    expect(decoded).toBe('<div>Hello</div>');
  });

  it('debería decodificar comillas', () => {
    const encoded = '&quot;Hello World&quot;';
    const decoded = decodeHtmlEntities(encoded);
    expect(decoded).toBe('"Hello World"');
  });

  it('debería decodificar ampersands', () => {
    const encoded = 'Tom &amp; Jerry';
    const decoded = decodeHtmlEntities(encoded);
    expect(decoded).toBe('Tom & Jerry');
  });

  it('debería retornar texto sin cambios si no hay entidades', () => {
    const text = 'Hello World';
    const decoded = decodeHtmlEntities(text);
    expect(decoded).toBe('Hello World');
  });

  it('debería manejar strings vacíos', () => {
    expect(decodeHtmlEntities('')).toBe('');
  });

  it('debería decodificar objetos', () => {
    const obj = { question: '&lt;b&gt;Test&lt;/b&gt;' };
    const decoded = decodeHtmlInObject(obj);
    expect(decoded.question).toBe('<b>Test</b>');
  });
});

