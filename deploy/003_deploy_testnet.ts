import {DeployFunction} from 'hardhat-deploy/types';
import 'hardhat-deploy-ethers';
import 'hardhat-deploy';
import {parseUnits} from '@ethersproject/units';
import {constants} from 'ethers';

const run: DeployFunction = async (hre) => {
  const {deployments, getNamedAccounts, getUnnamedAccounts} = hre;
  const {deploy, get, execute} = deployments;
  const {creator} = await getNamedAccounts();
  const [, , , mockBurnPool] = await getUnnamedAccounts();
  console.log('Creator', creator);
  console.log('burner address', mockBurnPool);

  const link = '0x84b9B910527Ad5C03A9Ca831909E21e236EA7b06';
  const vrfCoordinator = '0xa555fC018435bef5A13C6c6870a9d4C11DEC329C';
  const keyHash = '0xcaf3c3727e033261d383b315559476f48034c13b18f8cafed4d871abe5049186';
  const vrfFee = parseUnits('0.1', 18);

  const iron = await deploy('MockIRON', {
    from: creator,
    log: true,
    args: [parseUnits('3000000000000', 18)],
  });

  const lottery = await deploy('Lottery', {
    from: creator,
    log: true,
    args: [constants.AddressZero],
  });

  const prizeReservePool = await deploy('PrizeReservePool', {
    from: creator,
    log: true,
    args: [iron.address, lottery.address],
  });

  const taxService = await deploy('TaxService', {
    from: creator,
    log: true,
    args: [],
  });

  const ticket = await deploy('Ticket', {
    contract: 'Ticket',
    from: creator,
    log: true,
    args: ['http://api.iron.finance/lottery/tickets/{id}.json', lottery.address],
  });

  const randomGen = await deploy('RandomNumberGenerator', {
    from: creator,
    log: true,
    args: [vrfCoordinator, link, lottery.address, keyHash, vrfFee],
  });

  await execute(
    'Lottery',
    {from: creator, log: true},
    'initialize',
    iron.address,
    ticket.address,
    randomGen.address,
    prizeReservePool.address,
    taxService.address,
    creator
  );
  await execute(
    'TaxService',
    {from: creator, log: true},
    'initialize',
    iron.address,
    lottery.address,
    prizeReservePool.address,
    mockBurnPool,
    mockBurnPool
  );
  await execute('Lottery', {from: creator, log: true}, 'setTaxRate', 300000);

  await execute(
    'Lottery',
    {from: creator, log: true},
    'updateLottoSettings',
    8,
    5,
    [800000, 100000, 100000, 0],
    parseUnits('2', 18),
    parseUnits('30000', 18)
  );
};

run.tags = ['testnet'];

run.skip = async (hre) => {
  return hre.network.name !== 'testnet';
};

export default run;
