import { ethers } from 'ethers';
import contractData from '../contracts/RegistroImpacto.json';

const CONTRACT_ADDRESS = '0xC0dEF23D9E7347bdC029786271f51e925770a8C9';
const RPC_URL = 'https://sepolia.gateway.tenderly.co';

export const getContractReadOnly = () => {
  const provider = new ethers.JsonRpcProvider(RPC_URL);
  return new ethers.Contract(CONTRACT_ADDRESS, contractData.abi, provider);
};

export const getContract = async (signer: any) => {
  return new ethers.Contract(CONTRACT_ADDRESS, contractData.abi, signer);
};