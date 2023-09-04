const sum = require('./sum');

test('adds 1 + 1 to be 2', () => {
    expect(sum(1, 1)).toBe(`Sum is 2`);
});