import * as Utils from '../utils';

test('Should flat a multidimensional array', () => {
  const multiArray = [1, [2], [3, 4], [], [5], [6, [7]], [[[8]]]];
  const result = Utils.flatArray(multiArray);
  expect(result).toEqual([1, 2, 3, 4, 5, 6, 7, 8]);
});

test('Should split array in optimal pages based on page size', () => {
  const array = [1, 2, 3, 4, 5, 6, 7, 8];
  let result = Utils.splitInPages(array, 2);
  expect(result.length).toEqual(4);

  result = Utils.splitInPages(array, 3);
  expect(result.length).toEqual(3);

  result = Utils.splitInPages(array, 6);
  expect(result.length).toEqual(2);
  expect(result[1]).toEqual([7, 8]);
});
