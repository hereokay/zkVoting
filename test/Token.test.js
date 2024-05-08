const { expect } = require("chai");

describe("Token contract", function () {
  let Token;
  let token;
  let owner;
  let addr1;

  beforeEach(async function () {
    Token = await ethers.getContractFactory("Token");
    [owner, addr1] = await ethers.getSigners();
    token = await Token.deploy(1000);
  });

  describe("Token distribution", function () {
    it("should transfer tokens to addr1", async function () {
      await token.transfer(addr1.address, 500);
      expect(await token.balanceOf(addr1.address)).to.equal(500);
    });
  });
});
