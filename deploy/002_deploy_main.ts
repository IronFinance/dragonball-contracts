import {DeployFunction} from 'hardhat-deploy/types';
import 'hardhat-deploy-ethers';
import 'hardhat-deploy';
import {parseUnits} from '@ethersproject/units';
import {constants} from 'ethers';

const run: DeployFunction = async (hre) => {
  const {deployments, getNamedAccounts, getUnnamedAccounts} = hre;
  const {deploy, get, execute} = deployments;
  const {creator} = await getNamedAccounts();

  const link = await get('MockLink');
  const iron = await get('MockIRON');
  const vrf = await get('MockVRFCoordinator');

  const timer = await deploy('Timer', {
    from: creator,
    log: true,
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
  const burnSteelPool = await deploy('BurnSteelPool', {
    from: creator,
    log: true,
    args: [iron.address],
  });

  const burnDndPool = await deploy('BurnDndPool', {
    from: creator,
    log: true,
    args: [iron.address],
  });

  const taxService = await deploy('TaxService', {
    from: creator,
    log: true,
    args: [],
  });

  const lotteryTicket = await deploy('Ticket', {
    contract: 'Ticket',
    from: creator,
    log: true,
    args: ['http://api.iron.finance/lottery/tickets/{id}.json', lottery.address],
  });

  const randomGen = await deploy('RandomNumberGenerator', {
    from: creator,
    log: true,
    args: [
      vrf.address,
      link.address,
      lottery.address,
      '0x2ed0feb3e7fd2022120aa84fab1945545a9f2ffc9076fd6156fa96eaff4c1311',
      parseUnits('0.1', 18),
    ],
  });

  await execute(
    'Lottery',
    {from: creator, log: true},
    'initialize',
    iron.address,
    lotteryTicket.address,
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
    burnSteelPool.address,
    burnDndPool.address
  );
  await execute('Lottery', {from: creator, log: true}, 'setTaxRate', 300000);

  await execute(
    'Lottery',
    {from: creator, log: true},
    'updateLottoSettings',
    35,
    24,
    [800000, 100000, 100000, 0],
    parseUnits('1', 18),
    parseUnits('2000', 18)
  );

  await execute('MockLink', {from: creator, log: true}, 'transfer', randomGen.address, parseUnits('10000', 18));
};

run.tags = ['localhost'];

run.skip = async (hre) => {
  return hre.network.name !== 'localhost' && hre.network.name !== 'hardhat';
};

export default run;
