import {expect} from './test-helper';
import {ethers, deployments, getNamedAccounts} from 'hardhat';

describe('Validate tickets', () => {
  it('should validate tickets', async () => {
    const {deploy} = deployments;
    const {creator} = await getNamedAccounts();
    await deploy('Test', {
      from: creator,
    });

    const sut = await ethers.getContract('Test');

    await expect(sut.validateTicketNumbers(1, [1, 2, 3, 4, 2])).to.not.reverted;
    await expect(sut.validateTicketNumbers(3, [1, 2, 3, 4, 2, 11, 23, 14, 1, 20, 8, 7, 16, 35, 24])).to.not.reverted;
    await expect(sut.validateTicketNumbers(51, [1])).to.be.revertedWith('Batch mint too large');
    await expect(sut.validateTicketNumbers(1, [1])).to.be.revertedWith('Invalid chosen numbers');
    await expect(sut.validateTicketNumbers(1, [1])).to.be.revertedWith('Invalid chosen numbers');
    await expect(sut.validateTicketNumbers(1, [1, 3, 3, 4, 5])).to.be.revertedWith('duplicate number');
    await expect(sut.validateTicketNumbers(1, [1, 2, 3, 36, 5])).to.be.revertedWith('out of range: number');
    await expect(sut.validateTicketNumbers(1, [1, 2, 3, 4, 35])).to.be.revertedWith('out of range: power number');
  });
});
