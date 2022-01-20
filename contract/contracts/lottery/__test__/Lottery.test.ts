import { assert, expect } from "chai";
import ganache from "ganache-core";
import Web3 from "web3";
import { compileContract } from "../../../compile";
import solc from "solc";

//@ts-expect-error
const web3 = new Web3(ganache.provider());

const lotteryContract = compileContract("Lottery");

const setUpContractWithAccounts = async (
  baseContract: solc.CompiledContract
) => {
  const accounts = await web3.eth.getAccounts();
  return {
    accounts,
    organizerAddress: accounts[0],
    participatorsAddresses: accounts.slice(1),
    deployedContract: await new web3.eth.Contract(baseContract.abi as solc.Abi)
      .deploy({
        data: baseContract?.evm?.bytecode.object as string,
      })
      .send({ from: accounts[0], gas: 2000000 }),
  };
};

describe("Lottery contract", () => {
  it("Deploys a contract", async () => {
    const { deployedContract } = await setUpContractWithAccounts(
      lotteryContract
    );

    expect(deployedContract.options.address).to.be.a("string");
    expect(deployedContract.options.address).to.have.lengthOf(42);
  });

  it("The creator is the organizer", async () => {
    const { deployedContract, organizerAddress } =
      await setUpContractWithAccounts(lotteryContract);

    const contractOrganizerAddress = await deployedContract.methods
      .organizerAddress()
      .call();

    expect(contractOrganizerAddress).to.be.a("string");
    expect(contractOrganizerAddress).to.have.lengthOf(42);
    expect(contractOrganizerAddress).to.be.equal(organizerAddress);
  });

  it("can not participate if sent amount is lower than 0.001 ether", async () => {
    const { deployedContract, participatorsAddresses } =
      await setUpContractWithAccounts(lotteryContract);

    try {
      await deployedContract.methods.participateLottery().send({
        from: participatorsAddresses[0],
        value: web3.utils.toWei("0.0009", "ether"),
      });

      assert(false);
    } catch (error) {
      expect((error as Error).message).to.includes(
        "You should at least send 1 Ethers"
      );
    }
  });

  it("can participate if sent amount is 0.001 ether", async () => {
    const { deployedContract, participatorsAddresses } =
      await setUpContractWithAccounts(lotteryContract);

    await deployedContract.methods.participateLottery().send({
      from: participatorsAddresses[0],
      value: web3.utils.toWei("0.001", "ether"),
    });

    const numberOfParticipators = await deployedContract.methods
      .getNumberOfParticipators()
      .call();

    const allParticipators = await deployedContract.methods
      .getAllParticipators()
      .call();

    expect(numberOfParticipators).to.be.equal("1");
    expect(allParticipators.includes(participatorsAddresses[0])).to.be.true;
  });

  it("Registry balance is update when a participatorsAddresses enter the lottery", async () => {
    const { deployedContract, participatorsAddresses } =
      await setUpContractWithAccounts(lotteryContract);

    await deployedContract.methods.participateLottery().send({
      from: participatorsAddresses[0],
      value: web3.utils.toWei("0.001", "ether"),
    });

    const registryBalance = await deployedContract.methods.getBalance().call();

    expect(registryBalance).to.be.equal("1000000000000000");
  });

  it("Can get participatorsAddresses address", async () => {
    const { deployedContract, participatorsAddresses } =
      await setUpContractWithAccounts(lotteryContract);

    await deployedContract.methods.participateLottery().send({
      from: participatorsAddresses[0],
      value: web3.utils.toWei("0.001", "ether"),
    });

    const participatorAddress = await deployedContract.methods
      .getParticipatorAddress(1)
      .call();

    expect(participatorAddress).to.be.equal(participatorsAddresses[0]);
  });

  it("Multiple participatorsAddresses can enter the lottery", async () => {
    const { deployedContract, participatorsAddresses } =
      await setUpContractWithAccounts(lotteryContract);

    await deployedContract.methods.participateLottery().send({
      from: participatorsAddresses[0],
      value: web3.utils.toWei("0.001", "ether"),
    });

    await deployedContract.methods.participateLottery().send({
      from: participatorsAddresses[1],
      value: web3.utils.toWei("0.001", "ether"),
    });

    const numberOfParticipators = await deployedContract.methods
      .getNumberOfParticipators()
      .call();

    const allParticipators = await deployedContract.methods
      .getAllParticipators()
      .call();

    expect(numberOfParticipators).to.be.equal("2");
    expect(allParticipators.includes(participatorsAddresses[0])).to.be.true;
    expect(allParticipators.includes(participatorsAddresses[1])).to.be.true;
  });

  it("can not participate twice", async () => {
    const { deployedContract, participatorsAddresses } =
      await setUpContractWithAccounts(lotteryContract);

    await deployedContract.methods.participateLottery().send({
      from: participatorsAddresses[0],
      value: web3.utils.toWei("0.001", "ether"),
    });

    try {
      await deployedContract.methods.participateLottery().send({
        from: participatorsAddresses[0],
        value: web3.utils.toWei("0.001", "ether"),
      });

      assert(false);
    } catch (error) {
      expect((error as Error).message).to.includes("Already registered");
    }
  });

  it("Only organizer can pick a winner", async () => {
    const { deployedContract, participatorsAddresses } =
      await setUpContractWithAccounts(lotteryContract);

    await deployedContract.methods.participateLottery().send({
      from: participatorsAddresses[0],
      value: web3.utils.toWei("0.001", "ether"),
    });

    try {
      await deployedContract.methods.pickWinner().send({
        from: participatorsAddresses[0],
      });

      assert(false);
    } catch (error) {
      expect((error as Error).message).to.includes(
        "Only the organizer can pick a winner"
      );
    }
  });

  it("Organizer can pick a winner", async () => {
    const { deployedContract, participatorsAddresses, organizerAddress } =
      await setUpContractWithAccounts(lotteryContract);

    await deployedContract.methods.participateLottery().send({
      from: participatorsAddresses[0],
      value: web3.utils.toWei("0.001", "ether"),
    });

    await deployedContract.methods.pickWinner().send({
      from: organizerAddress,
    });

    const registryBalance = await deployedContract.methods.getBalance().call();

    expect(registryBalance).to.equal("0");
  });

  it("After picking a winner a new round starts", async () => {
    const { deployedContract, participatorsAddresses, organizerAddress } =
      await setUpContractWithAccounts(lotteryContract);

    await deployedContract.methods.participateLottery().send({
      from: participatorsAddresses[0],
      value: web3.utils.toWei("0.001", "ether"),
    });

    await deployedContract.methods.pickWinner().send({
      from: organizerAddress,
    });

    const lotteryRound = await deployedContract.methods
      .lotteryRoundNumber()
      .call();

    expect(lotteryRound).to.equal("2");
  });

  it("After picking a winner a new round starts with empty participatorsAddresses", async () => {
    const { deployedContract, participatorsAddresses, organizerAddress } =
      await setUpContractWithAccounts(lotteryContract);

    await deployedContract.methods.participateLottery().send({
      from: participatorsAddresses[0],
      value: web3.utils.toWei("0.001", "ether"),
    });

    await deployedContract.methods.pickWinner().send({
      from: organizerAddress,
    });

    const currentParticipatorsAddresses = await deployedContract.methods
      .getAllParticipators()
      .call();

    const numberOfParticipators = await deployedContract.methods
      .getNumberOfParticipators()
      .call();

    expect(currentParticipatorsAddresses).deep.equal([]);
    expect(numberOfParticipators).to.equal("0");
  });

  it("After picking a winner a new round starts and previous participators can participate again", async () => {
    const { deployedContract, participatorsAddresses, organizerAddress } =
      await setUpContractWithAccounts(lotteryContract);

    await deployedContract.methods.participateLottery().send({
      from: participatorsAddresses[0],
      value: web3.utils.toWei("0.001", "ether"),
    });

    await deployedContract.methods.pickWinner().send({
      from: organizerAddress,
    });

    const canParticipateAgain = await deployedContract.methods
      .canParticipate()
      .call({
        from: participatorsAddresses[0],
      });

    expect(canParticipateAgain).to.equal(true);
  });
});
