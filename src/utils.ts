/**
 * Provides utils functions.
 */
/**
 * Split an array of items in pages.
 * @param array Array of any items.
 * @param pageSize Page size to split array.
 * @returns Paged array
 */
export function splitInPages<T>(array: T[], pageSize: number): T[][] {
  const totalPages = Math.round(array.length / pageSize);
  // tslint:disable-next-line:prefer-const
  let pages = [];
  let itemsCounter = 0;

  for (let i = 0; i < totalPages; i++) {
    // tslint:disable-next-line:prefer-const
    let pagedItems = [];

    for (let j = 0; j < pageSize; j++) {
      pagedItems.push(array[itemsCounter]);
      if (++itemsCounter === array.length) {
        break;
      }
    }
    pages.push(pagedItems);
  }

  return pages;
}