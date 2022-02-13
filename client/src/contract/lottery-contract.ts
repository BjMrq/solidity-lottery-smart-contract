import web3 from "./web3-instance";
import { AbiItem } from "web3-utils";
import { LotteryContractAbi } from "./lottery-contract-abi";

export const lotteryContractAddress =
  "0xb9522B1132BE29f81BC006c911c7E2a26a24ba60";

export const lotteryContractAbiObject = [
  {
    inputs: [],
    stateMutability: "nonpayable",
    type: "constructor",
    signature: "constructor",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "participantAddress",
        type: "address",
      },
      {
        indexed: true,
        internalType: "uint256",
        name: "participationValue",
        type: "uint256",
      },
    ],
    name: "NewParticipation",
    type: "event",
    signature:
      "0x66ed5044191d198c3de93e96770e338defd59a6748f5ae550465bc4f274129b1",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "winnerAddress",
        type: "address",
      },
    ],
    name: "WinnerPicked",
    type: "event",
    signature:
      "0x5b690ec4a06fe979403046eaeea5b3ce38524683c3001f662c8b5a829632f7df",
  },
  {
    inputs: [],
    name: "canParticipate",
    outputs: [{ internalType: "bool", name: "", type: "bool" }],
    stateMutability: "view",
    type: "function",
    constant: true,
    signature: "0xa7d257f6",
  },
  {
    inputs: [],
    name: "getAllParticipators",
    outputs: [{ internalType: "address[]", name: "", type: "address[]" }],
    stateMutability: "view",
    type: "function",
    constant: true,
    signature: "0x24540941",
  },
  {
    inputs: [],
    name: "getBalance",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
    constant: true,
    signature: "0x12065fe0",
  },
  {
    inputs: [],
    name: "getNumberOfParticipators",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
    constant: true,
    signature: "0x8f117ea3",
  },
  {
    inputs: [
      { internalType: "uint104", name: "participatorNumber", type: "uint104" },
    ],
    name: "getParticipatorAddress",
    outputs: [{ internalType: "address", name: "", type: "address" }],
    stateMutability: "view",
    type: "function",
    constant: true,
    signature: "0x9c4c7aa4",
  },
  {
    inputs: [],
    name: "lotteryRoundNumber",
    outputs: [{ internalType: "int32", name: "", type: "int32" }],
    stateMutability: "view",
    type: "function",
    constant: true,
    signature: "0x886e7225",
  },
  {
    inputs: [],
    name: "organizerAddress",
    outputs: [{ internalType: "address", name: "", type: "address" }],
    stateMutability: "view",
    type: "function",
    constant: true,
    signature: "0xc373ec8d",
  },
  {
    inputs: [],
    name: "participateLottery",
    outputs: [],
    stateMutability: "payable",
    type: "function",
    payable: true,
    signature: "0x8357f987",
  },
  {
    inputs: [],
    name: "pickWinner",
    outputs: [{ internalType: "address", name: "", type: "address" }],
    stateMutability: "nonpayable",
    type: "function",
    signature: "0x5d495aea",
  },
] as (AbiItem & { signature: string })[];

export const lotteryContract = new web3.eth.Contract(
  lotteryContractAbiObject,
  lotteryContractAddress
);

export const lotteryContractEvents = lotteryContract.events;

export const lotteryContractAbi = lotteryContract.methods as LotteryContractAbi;
