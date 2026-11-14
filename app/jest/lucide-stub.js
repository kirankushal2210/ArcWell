// Jest only: icons render nothing in unit tests of plain logic (lucide ships ES modules Jest can't load).
module.exports = new Proxy({ __esModule: true }, { get: (t, k) => (k in t ? t[k] : () => null) });
