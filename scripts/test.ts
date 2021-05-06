import {BigNumber} from '@ethersproject/bignumber';
import {formatUnits, parseUnits} from '@ethersproject/units';
import {constants} from 'ethers';
import {TransactionResponse} from '@ethersproject/providers';
import {ethers} from 'hardhat';

async function main() {
  const lottery = await ethers.getContract('Lottery');
  const PrizeReservePool = await ethers.getContract('PrizeReservePool');
  const ticket = await ethers.getContract('Ticket');
  const timer = await ethers.getContract('Timer');
  const iron = await ethers.getContract('MockIRON');
  const [owner, , , , alice, bob] = await ethers.getSigners();
  const vrf = await ethers.getContract('MockVRFCoordinator');
  const rand = await ethers.getContract('RandomNumberGenerator');

  const printBalance = async (address: string, tag: string) => {
    const bl = await iron.balanceOf(address);
    console.log(`${tag}: ${formatUnits(bl, 18)}`);
  };

  vrf.once('RandomnessRequest', console.log.bind(console, 'RandomnessRequest'));

  await iron.transfer(alice.address, parseUnits('100', 18));
  await iron.transfer(bob.address, parseUnits('100', 18));
  await iron.transfer(PrizeReservePool.address, parseUnits('30000', 18));
  await iron.connect(alice).approve(lottery.address, constants.MaxUint256);
  await iron.connect(bob).approve(lottery.address, constants.MaxUint256);

  const startTime = Math.floor(Date.now() / 1000);
  const closeTime = startTime + 60;
  await lottery.updateLottoSettings(6, 6, [800000, 100000, 100000, 0], parseUnits('1', 18), parseUnits('2000', 18));
  await timer.setCurrentTime(startTime);
  await lottery.updateDefaultDuration(60);
  await lottery.autoStartLotto();
  console.log('buy ticket : \n');
  await printBalance(alice.address, 'alice');
  await printBalance(bob.address, 'bob');
  await lottery.connect(alice).batchBuyLottoTicket(1, 2, [1, 5, 3, 4, 3, 1, 5, 4, 2, 6]);
  await lottery.connect(bob).batchBuyLottoTicket(1, 2, [2, 3, 5, 6, 1, 1, 3, 4, 5, 6]);
  console.log('after buy ticket : \n');
  await printBalance(alice.address, 'alice');
  await printBalance(bob.address, 'bob');
  await timer.setCurrentTime(closeTime + 1);
  const tx = (await lottery.drawWinningNumbers(1, BigNumber.from(12345))) as TransactionResponse;
  const receipt = (await tx.wait()) as any;
  const requestId = receipt.events[1].args.requestId;
  await vrf.callBackWithRandomness(requestId, BigNumber.from('123489754321'), rand.address);
  console.log('winning numbers : \n');
  const winningNumbers = (await lottery.getCurrentLotto()).winningNumbers;
  console.log(winningNumbers);

  await lottery.connect(alice).claimReward(1, 2).catch(console.error);
  await lottery.connect(bob).claimReward(1, 4).catch(console.error);
  console.log('after claim : \n');
  await printBalance(alice.address, 'alice');
  await printBalance(bob.address, 'bob');
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
