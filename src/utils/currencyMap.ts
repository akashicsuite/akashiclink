import type { IWalletCurrency } from '../constants/currencies';

/**
 * Hashmap for storing and looking up values assigned to wallet currencies
 */
export class CurrencyMap<T> extends Map {
  get(c: IWalletCurrency) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return super.get(this.toKey(c));
  }

  set(c: IWalletCurrency, value: T) {
    return super.set(this.toKey(c), value);
  }

  has(c: IWalletCurrency) {
    return super.has(this.toKey(c));
  }

  delete(c: IWalletCurrency) {
    return super.delete(this.toKey(c));
  }

  toKey(c: IWalletCurrency) {
    return JSON.stringify(c);
  }
}
