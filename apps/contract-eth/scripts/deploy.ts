import { network } from "hardhat";

let WETH_ADDR = "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2";
let LOP_ADDR: string | null = null;
let FEE_TOKEN_ADDR: string | null = null;
let ACCESS_TOKEN_ADDR: string | null = null;
let ESCROW_FACTORY_ADDR: string | null = null;
let RESOLVER_CONTRACT_ADDR: string | null = null;

const { ethers } = await network.connect();

const networkInfo = await ethers.provider.getNetwork();
const chainId = networkInfo.chainId.toString();
console.log("network id ", chainId);

if (!chainId) {
  console.log("No chain id");
  process.exit();
}

const [feeOwner, accessOwner, escrowFactoryOwner, resolverOwner] =
  await ethers.getSigners();

if (!LOP_ADDR) {
  const LOPFactory = await ethers.getContractFactory("LimitOrderProtocol");
  const lop = await LOPFactory.deploy(WETH_ADDR);
  LOP_ADDR = await lop.getAddress();
  console.log("LOP deployed at:", LOP_ADDR);
}

const MockERCFactory = await ethers.getContractFactory("MockERC20");
if (!FEE_TOKEN_ADDR) {
  const feeToken = await MockERCFactory.deploy(
    feeOwner.address,
    "FeeToken",
    "FeeT"
  );
  FEE_TOKEN_ADDR = await feeToken.getAddress();
  console.log("Fee token deployed at:", FEE_TOKEN_ADDR);
}

if (!ACCESS_TOKEN_ADDR) {
  const accessToken = await MockERCFactory.deploy(
    accessOwner.address,
    "AccessToken",
    "AccT"
  );
  ACCESS_TOKEN_ADDR = await accessToken.getAddress();
  console.log("Access token deployed at:", ACCESS_TOKEN_ADDR);
}

if (!ESCROW_FACTORY_ADDR) {
  const EscrowFactory = await ethers.getContractFactory("EscrowFactory");
  const escrowFactory = await EscrowFactory.deploy(
    LOP_ADDR,
    FEE_TOKEN_ADDR,
    ACCESS_TOKEN_ADDR,
    escrowFactoryOwner.address,
    1000n,
    1000n
  );
  ESCROW_FACTORY_ADDR = await escrowFactory.getAddress();
  console.log("Escrow Factory deployed at:", ESCROW_FACTORY_ADDR);
}

if (!RESOLVER_CONTRACT_ADDR) {
  const ResolverFactory = await ethers.getContractFactory("Resolver");
  const resolverContract = await ResolverFactory.deploy(
    ESCROW_FACTORY_ADDR,
    LOP_ADDR,
    resolverOwner.address
  );
  RESOLVER_CONTRACT_ADDR = await resolverContract.getAddress();
  console.log("Escrow Factory deployed at:", RESOLVER_CONTRACT_ADDR);
}
