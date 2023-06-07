
exports.getWebCrypto = function() {
  let crypto = global.crypto || require('crypto');
  if (!crypto) throw Error('Failed to retrieve crypto instance');
  if (crypto.webcrypto) crypto = crypto.webcrypto;
  return crypto;
}
