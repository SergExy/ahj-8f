/**
* @jest-environment jsdom
*/

import createElement from '../createElement';

test('test create html element', () => {
  const result = createElement({
    name: 'a',
    classes: ['example', 'example2'],
    text: 'link',
    attributes: [
      { name: 'href', value: '#' },
    ],
  });

  expect(result).toBeInstanceOf(HTMLElement);
});

test('test add class', () => {
  const result = createElement({
    name: 'a',
    classes: ['example', 'example2'],
  });

  const { className } = result;

  const expected = 'example example2';

  expect(className).toBe(expected);
});
