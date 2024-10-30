export const storageWithExpiry = {
  setItem(key: string, value: boolean, ttl: number = 3600000) {
    // default 1 hour in milliseconds
    const item = {
      value: value,
      expireTime: Date.now() + ttl,
    };
    localStorage.setItem(key, JSON.stringify(item));
  },

  getItem(key: string) {
    const itemStr = localStorage.getItem(key);
    if (!itemStr) return null;

    const item = JSON.parse(itemStr);
    if (Date.now() > item.expireTime) {
      localStorage.removeItem(key);
      return null;
    }
    return item.value;
  },
};
