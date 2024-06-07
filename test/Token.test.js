const { expect } = require("chai");
const hre = require("hardhat");
const { ethers } = require("ethers");
const path = require('path');
const fs = require('fs').promises;
const SnarkJS = require("snarkjs");



const $u = require("../zkp/$u.js");
const wc = require("../zkp/witness_calculator.js");

const {
    fetchUserList,
    putUserSalt,
    putUserAddress,
    getUserByCode
} = require("../utils/back.js");

// studentId : int
// salt : string
function calcStudentSaltHash(studentId, salt){

    const strId = studentId.toString();

    const sumString = strId + salt;
    return ethers.keccak256(ethers.toUtf8Bytes(sumString));
}

describe("contract deployment", function () {
    let token, votingBox;
    let owner, addr1, addr2, addr3, addr4, layer, candidate;
  
    let hasher, verifier, tornado;

    before(async function () {
        [owner, addr1, addr2, addr3, addr4, layer, candidate] = await hre.ethers.getSigners();

        // 투표토큰 배포
        token = await hre.ethers.deployContract("Token");
        console.log("Token address: ", token.target);
        // 투표관리 컨트랙트 배포
        votingBox = await hre.ethers.deployContract("VotingBox",[owner.address,token.target]);
        console.log("VotingBox address: ", votingBox.target);

        hasher = await hre.ethers.deployContract("Hasher");
        console.log("Hasher address: ", hasher.target);

        verifier = await hre.ethers.deployContract("Verifier");
        console.log("Verifier address: ", verifier.target);

        tornado = await hre.ethers.deployContract("Tornado", [hasher.target, verifier.target]);
        console.log("Tornado address: ", tornado.target);

    });
    
    it("VotingBox에게 mint 권한부여", async function () {
        await token.setOwner(votingBox.target);
        expect(await token.owner()).to.equal(votingBox.target);
    });
    it("권한없는 사람은 mint 실패", async function () {
        await expect(token.mint(addr1.address, ethers.parseEther("1")))
            .to.be.revertedWith("Sender not authorized.");  
    });

    describe("투표권 배포과정", function () {
        
        it("유권자 정보가져오기 및 Salt 등록", async function () {
            // await expect(token.mint(addr1.address, ethers.parseEther("1")))
            //     .to.be.revertedWith("Sender not authorized.");  

            await userSaltControl(votingBox);

        });        

        it("유권자 온체인 address 등록", async function () {
            const userList = await fetchUserList();

            userList[0]['Address'] = addr1.address;
            await putUserAddress(userList[0]);


            const randomSalt = BigInt(ethers.hexlify(ethers.randomBytes(32)))
            
        
        });

        it("후보자 온체인 address 등록", async function () {
            
            // candidate
            await votingBox.addCandidate(1, candidate.address);
        });

        // Salt 검증 로직
        // 1. 학번에 대한 SaltHash를 온체인에서 얻고 해당 Salt가 무결한지
        it("유권자 Salt 할당 및 조회 : 받은 Salt의 해시값과 나의 StudentId로 조회한 SaltHash가 일치해야함", async function () {            
            
            const user = await getUserByCode('12345');
            const saltHash = ethers.keccak256(ethers.toUtf8Bytes(user['Salt']));


            

            // 학번에 대한 Salt 할당
            await votingBox.setSaltForOne(user['Code'],saltHash);

            // 학번에 대한 Salt 해시 조회 (재확인)
            expect(await votingBox.studentSaltTable(user['Code'])).to.equal(
                saltHash
            );
        });

        it("유권자의 주소를 설정, 해당 주소에 대한 토큰 Balance는 1 ETH 임", async function () {

            const user = await getUserByCode("12345");

            // H(StudentId + Salt)
            const oneHash = calcStudentSaltHash(user['Code'],user['Salt']);

            // 유권자 주소 할당
            await votingBox.registVoter(addr1.address, oneHash);
            
        

            // 토큰이 할당되었는지 확인
            await expect(await token.balanceOf(addr1.address)).to.equal(ethers.parseEther("1"));
        });


        // Salt 검증 로직
        // 2. student와 salt에 대한것으로 주소 확인
        it("유권자 Salt 할당 및 조회: StduentId와 salt를 해시한 값으로 계정주소를 조회하면 나의 주소가 리턴되어야 함", async function () {
            
            const user = await getUserByCode("12345");

            const oneHash = calcStudentSaltHash(user['Code'],user['Salt']);
            const retAddress = await votingBox.addressTable(oneHash);

            await expect(retAddress).is.equal(addr1.address);
        });

        describe("투표 과정 : Mixer와 상호작용", function () {

            const secret = BigInt(ethers.hexlify(ethers.randomBytes(32)))
            const nullifier = BigInt(ethers.hexlify(ethers.randomBytes(32)))

            let proofElements ;

            // Mixer에 입금
            it("Mixer Deposit : Mixer의 토큰 개수는 1 ETH, 유권자 0 ETH", async function () {
                
                // approve
                const approveTx = await token.connect(addr1).approve(tornado.target, ethers.parseEther("1"));

                const input = {
                    secret: $u.BN256ToBin(secret).split(""),
                    nullifier: $u.BN256ToBin(nullifier).split("")
                };

                const filePath = path.join(__dirname, '../zkp/deposit.wasm');
                const buffer = await fs.readFile(filePath);
        
                // buffer를 사용하여 depositWC를 처리
                const depositWC = await wc(buffer);
        
                const r = await depositWC.calculateWitness(input, 0);
                
                const commitment = r[1];
                const nullifierHash = r[2];
                
                const depositTx = await tornado.connect(addr1).deposit(commitment,token.target);
                
                console.log(commitment)
                proofElements = {
                    nullifierHash: nullifierHash,
                    secret: secret,
                    nullifier: nullifier,
                    commitment: commitment,
                    txHash: depositTx.hash
                };
                
            });

            it("Mixer Withdraw : Mixer의 토큰 개수는 0 ETH, 후보자는 1 ETH", async function () {
                const receipt = await hre.ethers.provider.getTransactionReceipt(proofElements.txHash);
                if(!receipt){ throw "empty-receipt"; }

                const log = receipt.logs[1];
                // console.log(log)

                const tornadoArtifact = await hre.artifacts.readArtifact("Tornado");

                // ABI 추출
                const tornadoABI = tornadoArtifact.abi;
              
                // 인터페이스 생성
                const tornadoInterface = new ethers.Interface(tornadoABI);
              
                const decodedData = tornadoInterface.decodeEventLog("Deposit", log.data, log.topics); 
                

                // 누구에게 보낼지 선택
                // cadidate.address

                const proofInput = {
                    "root": $u.BNToDecimal(decodedData.root),
                    "nullifierHash": proofElements.nullifierHash,
                    "recipient": $u.BNToDecimal(candidate.address),
                    "secret": $u.BN256ToBin(proofElements.secret).split(""),
                    "nullifier": $u.BN256ToBin(proofElements.nullifier).split(""),
                    "hashPairings": decodedData.hashPairings.map((n) => ($u.BNToDecimal(n))),
                    "hashDirections": decodedData.pairDirection
                };

                const withdrawPath = path.join(__dirname, '../zkp/withdraw.wasm');
                const setupPath = path.join(__dirname, '../zkp/setup_final.zkey');
                const { proof, publicSignals } = await SnarkJS.groth16.fullProve(proofInput, withdrawPath, setupPath);

                const callInputs = [
                    proof.pi_a.slice(0, 2).map($u.BN256ToHex),
                    proof.pi_b.slice(0, 2).map((row) => ($u.reverseCoordinate(row.map($u.BN256ToHex)))),
                    proof.pi_c.slice(0, 2).map($u.BN256ToHex),
                    publicSignals.slice(0, 2).map($u.BN256ToHex)
                ];
                
                // console.log(callInputs);

                
                const tx = await tornado.connect(layer).withdraw(...callInputs, token.target, candidate.address);
                
                
                await expect(await token.balanceOf(candidate.address)).to.equal(ethers.parseEther("1"));
                await expect(await token.balanceOf(tornado.target)).to.equal(ethers.parseEther("0"));
            });

        
        });

    });

});


async function userSaltControl(votingBox){
    const userList = await fetchUserList();

    for(let user of userList){
        const randomSalt = BigInt(ethers.hexlify(ethers.randomBytes(32)))
        user['Salt'] = randomSalt.toString();


        await putUserSalt(user);

        // onchain 호출
        await setUserSaltOnchain(user,votingBox);
    }

}



async function setUserSaltOnchain(user, votingBox){
    try {
        // user['Salt']
        const saltHash = BigInt(ethers.keccak256(ethers.toUtf8Bytes(user['Salt'])));
        await votingBox.setSaltForOne(user['Code'],saltHash);
        
    } catch (error) {
        console.error('There was a problem with the Onchain request:', error);
    }
}
