import {expect} from 'chai';
import {ethers, deployments, getNamedAccounts} from 'hardhat';

describe('Gen index', () => {
  it.only('should gen list of index', async () => {
    const {deploy} = deployments;
    const {creator} = await getNamedAccounts();
    await deploy('Test', {
      from: creator,
    });

    const sut = await ethers.getContract('Test');

    // const indexes = await sut.generateNumberIndexKey([1, 2, 3, 4, 12]);
    // console.log(indexes);
    // console.log(await sut.generateNumberIndexKey([1, 3, 2, 4, 12]));
    // console.log(await sut.generateNumberIndexKey([4, 3, 2, 1, 12]));
    console.log(await sut.generateNumberIndexKey([2, 5, 1, 6, 4]));
    console.log(await sut.generateNumberIndexKey([1, 5, 4, 2, 6]));
  });

  it('should gen random number', async () => {
    const {deploy} = deployments;
    const {creator} = await getNamedAccounts();
    await deploy('Test', {
      from: creator,
    });

    const sut = await ethers.getContract('Test');
    const count = {} as Record<number, number>;
    const size = 1000;

    for (let index = 0; index < size; index++) {
      const arr = (await sut.split(35, 24, index)) as number[];
      // console.log(arr);
      const normal = arr.slice(0, 4);
      normal.forEach((t) => {
        count[t] = (count[t] || 0) + 1;
      });

      expect(normal.every((x) => x > 0 && x <= 35)).to.be.true;
      expect(new Set(normal).size).to.eq(4);
      const pb = arr[4];
      expect(pb > 0 && pb <= 24).to.be.true;
    }

    Object.entries(count).forEach(([n, xh]) => {
      console.log(n, ':', (xh / size / 4) * 100);
    });
  }).timeout(60e3);
});
