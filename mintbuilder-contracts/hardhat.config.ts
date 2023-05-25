import { HardhatUserConfig } from "hardhat/config"
import "@nomicfoundation/hardhat-toolbox"
import "@nomicfoundation/hardhat-chai-matchers"
import "@nomiclabs/hardhat-ethers"
import "dotenv/config" // can load POLYGON_RPC & DEPLOYER_PRIV from .env or other secret store
import "coffeescript/register"

import "./tasks/deploy"

function env(name: string, defaultValue?: string): string {
  if (process.env[name] === undefined) {
    if (defaultValue) return defaultValue;
    throw Error(`Environment variable ${name} not set`);
  }
  return process.env[name] as string;
}

const config: HardhatUserConfig = {
  solidity: {
    version: '0.8.19',
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
    },
  },
  defaultNetwork: 'hardhat',
  networks: {
    hardhat: {},
    polygon: {
      url: env('POLYGON_RPC'),
      chainId: 137,
      accounts: [env('DEPLOYER_PRIV')],
    },
    polygonTestnet: {
      url: 'https://rpc-mumbai.maticvigil.com/',
      chainId: 80001,
      accounts: [env('DEPLOYER_PRIV')],
    }
  },
};

export default config;
