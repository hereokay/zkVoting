const { expect } = require("chai");
const hre = require("hardhat");
const { ethers } = require("ethers");



describe("VotingBox contract deployment", function () {
  let token, votingBox;
  let owner, addr1, addr2;
  


  beforeEach(async function () {
    [owner, addr1, addr2] = await hre.ethers.getSigners();

    // 투표토큰 배포
    token = await hre.ethers.deployContract("Token");

    // 투표관리 컨트랙트 배포
    votingBox = await hre.ethers.deployContract("VotingBox",[owner.address,token.target]);
  });

  describe("Token interactions", function () {
    it("should allow VotingBox to call mint on the Token contract", async function () {
      // Example interaction


      await token.mint(addr1.address, ethers.parseEther("1"));
      expect(await token.balanceOf(addr1.address)).to.equal(ethers.parseEther("1"));
      
    });
    
  });
});