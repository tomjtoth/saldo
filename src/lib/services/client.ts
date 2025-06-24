const clientConfig = {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  set(key: string, value: any) {
    const asStr = JSON.stringify(value);
    localStorage.setItem(key, asStr);
  },

  get(key: string) {
    const asStr = localStorage.getItem(key);
    return asStr ? JSON.parse(asStr) : null;
  },
};

export default clientConfig;
