import {DeployFunction} from 'hardhat-deploy/types';
import 'hardhat-deploy-ethers';
import 'hardhat-deploy';
import {HardhatRuntimeEnvironment} from 'hardhat/types';
import {parseUnits} from '@ethersproject/units';
import {parseBytes32String} from '@ethersproject/strings';

const run: DeployFunction = async (hre) => {
  const {ethers, deployments, getNamedAccounts} = hre;
  const {deploy} = deployments;
  const {creator} = await getNamedAccounts();
  console.log('creator', creator);

  const link = await deploy('MockLink', {
    from: creator,
    log: true,
    args: [parseUnits('100000000000', 18)],
  });

  await deploy('MockVRFCoordinator', {
    from: creator,
    log: true,
    args: [link.address, '0x2ed0feb3e7fd2022120aa84fab1945545a9f2ffc9076fd6156fa96eaff4c1311', parseUnits('0.1', 18)],
  });

  await deploy('MockIRON', {
    from: creator,
    log: true,
    args: [parseUnits('1000000', 18)],
  });

  await deploy('Timer', {
    from: creator,
    log: true,
  });
};

run.tags = ['mock'];

run.skip = async (hre) => {
  return hre.network.name !== 'localhost' && hre.network.name !== 'hardhat';
};
export default run;
