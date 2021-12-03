const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("LinkToken", function () {
  before(async () => {
    [admin, investor1, investor2, investor3] = await ethers.getSigners();
    LinkToken = await ethers.getContractFactory("LinkToken");
    linkToken = await LinkToken.deploy(1000000);
    await linkToken.deployed();
  });
  it("should setup token contract with correct values", async function () {
    expect(await linkToken.name()).to.equal("Link Token");
    expect(await linkToken.symbol()).to.equal("LINK");
  });
  it("should mint token supply to admin on deployment", async function () {
    expect(await linkToken.totalSupply()).to.equal(1000000);
    expect(await linkToken.balanceOf(admin.address)).to.equal(1000000);
  });

  it("should allow transfer of tokens", async function () {
    await expect(
      linkToken.transfer(investor1.address, 999999999)
    ).to.be.revertedWith("Insufficient funds");
    let transfer = await linkToken.callStatic.transfer(investor1.address, 100);
    expect(transfer).to.equal(true);
    let txn = await linkToken.transfer(investor1.address, 100);
    let reciept = await txn.wait();

    // Triggers one event
    expect(reciept.events.length).to.equal(1);
    // Event triggered should be the transfer event
    expect(reciept.events[0].event).to.equal("Transfer");
    // Event logs the correct required arguments
    expect(reciept.events[0].args._from).to.equal(admin.address);
    expect(reciept.events[0].args._to).to.equal(investor1.address);
    expect(reciept.events[0].args._value).to.equal(100);

    // Deducts & adds funds from intended accounts
    expect(await linkToken.balanceOf(investor1.address)).to.equal(100);
    expect(await linkToken.balanceOf(admin.address)).to.equal(999900);
  });
});
