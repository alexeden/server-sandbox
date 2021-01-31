/* eslint-disable prefer-arrow/prefer-arrow-functions */
class WebStorageUtility {
  static get(storage: Storage, key: string): any {
    const value = storage.getItem(key);
    try {
      return JSON.parse(value!);
    }
    catch (e) {
      return value;
    }
  }

  static set(storage: Storage, key: string, value: any) {
    const settableValue = typeof value === 'string' ? value : JSON.stringify(value);
    storage.setItem(key, settableValue);
  }

  static remove(storage: Storage, key: string) {
    storage.removeItem(key);
  }
}


// eslint-disable-next-line @typescript-eslint/naming-convention,no-underscore-dangle,id-blacklist,id-match
const WebStorageProxy = (storage: Storage, overrideKey?: string): PropertyDecorator => (target, propertyName): void => {
    const key = overrideKey || propertyName;

    Object.defineProperty(target, propertyName, {
      get() {
        return WebStorageUtility.get(storage, String(key));
      },
      set(value: any) {
        if (typeof value === 'undefined' || value === null) {
          WebStorageUtility.remove(storage, String(key));
        }
        else {
          WebStorageUtility.set(storage, String(key), value);
        }
      },
    });
  };

// eslint-disable-next-line @typescript-eslint/naming-convention,no-underscore-dangle,id-blacklist,id-match
export const LocalStorageProxy = (key?: string): PropertyDecorator => WebStorageProxy(localStorage, key);
// eslint-disable-next-line @typescript-eslint/naming-convention, no-underscore-dangle, id-blacklist, id-match
export const SessionStorageProxy = (key?: string): PropertyDecorator => WebStorageProxy(sessionStorage, key);
