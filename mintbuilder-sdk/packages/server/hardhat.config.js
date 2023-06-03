function env(key, defaultValue) {
  if (process.env[key] === undefined) {
    if (defaultValue === undefined)
      throw new Error(`Missing env var ${key}`)
    return defaultValue
  }
  return process.env[key]
}

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  defaultNetwork: 'hardhat',
  networks: {
    hardhat: {},
    polygonTestnet: {
      url: 'https://rpc-mumbai.maticvigil.com',
      chainId: 80001,
      accounts: [env('DEPLOYER_PRIV')],
    }
  },
}
