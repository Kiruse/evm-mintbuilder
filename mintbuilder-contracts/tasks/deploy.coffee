fs = require 'node:fs/promises'

task 'deploy', 'Deploy the MintBuilder Smart Contract', ->
  {default: chalk} = await import('chalk')
  [deployer] = await ethers.getSigners()
  MintBuilder = await ethers.getContractFactory 'MintBuilder'
  minter = await MintBuilder.deploy()
  
  console.log "Network: #{chalk.blue network.name}"
  console.log "MintBuilder deployed to: #{chalk.yellow minter.address}"
  console.log "Admin is: #{chalk.yellow deployer.address}"
  
  data = JSON.parse await fs.readFile 'deployments.json', 'utf8'
  data[network.name] =
    minter: minter.address
    admin: deployer.address
  await fs.writeFile 'deployments.json', JSON.stringify(data, null, 2)
