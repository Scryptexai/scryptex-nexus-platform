
import { expect } from "chai";
import { ethers } from "hardhat";
import { ScryptexFactory, TokenFactory, ScryptexDEX, ScryptexToken } from "../typechain-types";
import { SignerWithAddress } from "@nomicfoundation/hardhat-ethers/signers";

describe("SCRYPTEX Platform Integration Tests", function () {
  let scryptexFactory: ScryptexFactory;
  let tokenFactory: TokenFactory;
  let scryptexDEX: ScryptexDEX;
  let owner: SignerWithAddress;
  let user1: SignerWithAddress;
  let user2: SignerWithAddress;
  let feeRecipient: SignerWithAddress;

  const TOKEN_CREATION_FEE = ethers.parseEther("0.01");
  const PLATFORM_FEE_PERCENTAGE = 250; // 2.5%

  beforeEach(async function () {
    [owner, user1, user2, feeRecipient] = await ethers.getSigners();

    // Deploy ScryptexFactory
    const ScryptexFactory = await ethers.getContractFactory("ScryptexFactory");
    scryptexFactory = await ScryptexFactory.deploy(
      owner.address,
      TOKEN_CREATION_FEE,
      PLATFORM_FEE_PERCENTAGE,
      feeRecipient.address
    );
    await scryptexFactory.waitForDeployment();
  });

  describe("Token Creation and Trading Flow", function () {
    it("Should create token and add liquidity successfully", async function () {
      const tokenParams = {
        name: "Test Token",
        symbol: "TEST",
        totalSupply: ethers.parseEther("1000000"),
        description: "A test token",
        logoUrl: "https://example.com/logo.png",
        autoLiquidity: true
      };

      const liquidityETH = ethers.parseEther("0.5");
      const totalValue = TOKEN_CREATION_FEE + liquidityETH;

      // Create token with auto-liquidity
      const tx = await scryptexFactory.connect(user1).createToken(tokenParams, {
        value: totalValue
      });
      
      const receipt = await tx.wait();
      expect(receipt).to.not.be.null;

      // Check if token was created
      const userTokens = await scryptexFactory.getUserTokens(user1.address);
      expect(userTokens.length).to.equal(1);

      // Check if token is registered as Scryptex token
      const isScryptexToken = await scryptexFactory.isScryptexToken(userTokens[0]);
      expect(isScryptexToken).to.be.true;

      // Check total tokens count
      const totalTokens = await scryptexFactory.getTotalTokens();
      expect(totalTokens).to.equal(1);
    });

    it("Should handle token creation fee correctly", async function () {
      const initialBalance = await feeRecipient.provider.getBalance(feeRecipient.address);

      const tokenParams = {
        name: "Fee Test Token",
        symbol: "FEE",
        totalSupply: ethers.parseEther("500000"),
        description: "Testing fees",
        logoUrl: "",
        autoLiquidity: false
      };

      await scryptexFactory.connect(user1).createToken(tokenParams, {
        value: TOKEN_CREATION_FEE
      });

      const finalBalance = await feeRecipient.provider.getBalance(feeRecipient.address);
      expect(finalBalance - initialBalance).to.equal(TOKEN_CREATION_FEE);
    });

    it("Should reject token creation with insufficient fee", async function () {
      const tokenParams = {
        name: "Insufficient Fee Token",
        symbol: "IFT",
        totalSupply: ethers.parseEther("100000"),
        description: "Should fail",
        logoUrl: "",
        autoLiquidity: false
      };

      await expect(
        scryptexFactory.connect(user1).createToken(tokenParams, {
          value: ethers.parseEther("0.005") // Less than required fee
        })
      ).to.be.revertedWith("ScryptexFactory: Insufficient fee");
    });

    it("Should validate token parameters correctly", async function () {
      // Test empty name
      await expect(
        scryptexFactory.connect(user1).createToken({
          name: "",
          symbol: "EMPTY",
          totalSupply: ethers.parseEther("100000"),
          description: "",
          logoUrl: "",
          autoLiquidity: false
        }, { value: TOKEN_CREATION_FEE })
      ).to.be.revertedWith("ScryptexFactory: Name required");

      // Test empty symbol
      await expect(
        scryptexFactory.connect(user1).createToken({
          name: "Empty Symbol",
          symbol: "",
          totalSupply: ethers.parseEther("100000"),
          description: "",
          logoUrl: "",
          autoLiquidity: false
        }, { value: TOKEN_CREATION_FEE })
      ).to.be.revertedWith("ScryptexFactory: Symbol required");

      // Test zero supply
      await expect(
        scryptexFactory.connect(user1).createToken({
          name: "Zero Supply",
          symbol: "ZERO",
          totalSupply: 0,
          description: "",
          logoUrl: "",
          autoLiquidity: false
        }, { value: TOKEN_CREATION_FEE })
      ).to.be.revertedWith("ScryptexFactory: Supply must be > 0");
    });
  });

  describe("Platform Configuration", function () {
    it("Should allow owner to update platform config", async function () {
      const newConfig = {
        tokenCreationFee: ethers.parseEther("0.02"),
        platformFeePercentage: 300,
        feeRecipient: user2.address,
        paused: false
      };

      await scryptexFactory.connect(owner).updatePlatformConfig(newConfig);

      const updatedConfig = await scryptexFactory.getPlatformConfig();
      expect(updatedConfig.tokenCreationFee).to.equal(newConfig.tokenCreationFee);
      expect(updatedConfig.platformFeePercentage).to.equal(newConfig.platformFeePercentage);
      expect(updatedConfig.feeRecipient).to.equal(newConfig.feeRecipient);
    });

    it("Should reject config updates from non-owner", async function () {
      const newConfig = {
        tokenCreationFee: ethers.parseEther("0.02"),
        platformFeePercentage: 300,
        feeRecipient: user2.address,
        paused: false
      };

      await expect(
        scryptexFactory.connect(user1).updatePlatformConfig(newConfig)
      ).to.be.revertedWith("Ownable: caller is not the owner");
    });

    it("Should reject invalid fee percentage", async function () {
      const invalidConfig = {
        tokenCreationFee: ethers.parseEther("0.01"),
        platformFeePercentage: 1500, // 15% - too high
        feeRecipient: feeRecipient.address,
        paused: false
      };

      await expect(
        scryptexFactory.connect(owner).updatePlatformConfig(invalidConfig)
      ).to.be.revertedWith("ScryptexFactory: Fee too high");
    });
  });

  describe("Pause Functionality", function () {
    it("Should allow owner to pause and unpause", async function () {
      // Pause the contract
      await scryptexFactory.connect(owner).pause();

      const tokenParams = {
        name: "Paused Token",
        symbol: "PAUSE",
        totalSupply: ethers.parseEther("100000"),
        description: "Should fail when paused",
        logoUrl: "",
        autoLiquidity: false
      };

      // Should fail when paused
      await expect(
        scryptexFactory.connect(user1).createToken(tokenParams, {
          value: TOKEN_CREATION_FEE
        })
      ).to.be.revertedWith("Pausable: paused");

      // Unpause the contract
      await scryptexFactory.connect(owner).unpause();

      // Should work after unpause
      await expect(
        scryptexFactory.connect(user1).createToken(tokenParams, {
          value: TOKEN_CREATION_FEE
        })
      ).to.not.be.reverted;
    });
  });

  describe("Emergency Functions", function () {
    it("Should allow owner to perform emergency withdrawal", async function () {
      // Send some ETH to the contract
      await user1.sendTransaction({
        to: await scryptexFactory.getAddress(),
        value: ethers.parseEther("1.0")
      });

      const initialOwnerBalance = await owner.provider.getBalance(owner.address);
      const contractBalance = await owner.provider.getBalance(await scryptexFactory.getAddress());

      // Perform emergency withdrawal
      const tx = await scryptexFactory.connect(owner).emergencyWithdraw();
      const receipt = await tx.wait();
      const gasUsed = receipt!.gasUsed * receipt!.gasPrice;

      const finalOwnerBalance = await owner.provider.getBalance(owner.address);
      expect(finalOwnerBalance).to.be.closeTo(
        initialOwnerBalance + contractBalance - gasUsed,
        ethers.parseEther("0.01") // Small tolerance for gas estimation
      );
    });
  });

  describe("Multi-User Scenarios", function () {
    it("Should handle multiple users creating tokens", async function () {
      const tokenParams1 = {
        name: "User1 Token",
        symbol: "U1T",
        totalSupply: ethers.parseEther("100000"),
        description: "User 1's token",
        logoUrl: "",
        autoLiquidity: false
      };

      const tokenParams2 = {
        name: "User2 Token",
        symbol: "U2T",
        totalSupply: ethers.parseEther("200000"),
        description: "User 2's token",
        logoUrl: "",
        autoLiquidity: false
      };

      // User 1 creates a token
      await scryptexFactory.connect(user1).createToken(tokenParams1, {
        value: TOKEN_CREATION_FEE
      });

      // User 2 creates a token
      await scryptexFactory.connect(user2).createToken(tokenParams2, {
        value: TOKEN_CREATION_FEE
      });

      // Check user-specific tokens
      const user1Tokens = await scryptexFactory.getUserTokens(user1.address);
      const user2Tokens = await scryptexFactory.getUserTokens(user2.address);

      expect(user1Tokens.length).to.equal(1);
      expect(user2Tokens.length).to.equal(1);
      expect(user1Tokens[0]).to.not.equal(user2Tokens[0]);

      // Check total tokens
      const totalTokens = await scryptexFactory.getTotalTokens();
      expect(totalTokens).to.equal(2);
    });
  });
});
