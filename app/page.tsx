"use client";

import React, { useState } from "react";
import DappPortalSDK from "@linenext/dapp-portal-sdk";
import { TxType } from "@kaiachain/ethers-ext";
import { ethers } from "ethers";
import JSONPretty from "react-json-pretty";

interface RlpEncodedTx {
  raw: string;
}

export default function Page() {
  const [provider, setProvider] = useState<any>(null);
  const [accounts, setAccounts] = useState<any>([]);
  const [fdvt, setFdvt] = useState<string>("");
  const [fdvtm, setFdvtm] = useState<string>("");
  const [fdsc, setFdsc] = useState<string>("");
  const [vtTx, setVtTx] = useState({});
  const [vtmTx, setVtmTx] = useState({});
  const [scTx, setScTx] = useState({});
  const [scResult, setScResult] = useState({});
  const [vtResult, setVtResult] = useState({});
  const [vtmResult, setVtmResult] = useState({});

  const requestFeeDelegation = async (tx: RlpEncodedTx) => {
    const result = fetch(
      "https://fee-delegated-tx-example-dapp.vercel.app/api/requestFeeDelegation",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ userSignedTx: tx }),
      }
    )
      .then((response) => response.json())
      .then((data) => {
        return data;
      });
    return result;
  };

  const connectWalletByDappPortalSDK = async () => {
    const sdk = await DappPortalSDK.init({
      clientId: "30eb8e86-1096-44ef-b9db-f7efa00f9b89",
      chainId: "8217",
    });
    const provider = sdk.getWalletProvider();
    const accounts = await provider.request({ method: "eth_requestAccounts" });
    setProvider(provider);
    setAccounts(accounts);
  };

  const feeDelegatedValueTransfer = async () => {
    if (!provider) {
      alert("Please connect wallet first");
      return;
    }
    const accountAddress = accounts[0];
    const tx = {
      typeInt: TxType.FeeDelegatedValueTransfer,
      from: accountAddress,
      to: accountAddress,
      value: "0x10",
      feePayer: "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
    };
    setVtTx(tx);

    const userSignedTx = await provider.request({
      method: "kaia_signTransaction",
      params: [tx],
    });
    setFdvt(userSignedTx);
    const data = await requestFeeDelegation(userSignedTx);
    setVtResult(data);
  };

  const feeDelegatedSmartContractExeuction = async () => {
    if (!provider) {
      alert("Please connect wallet first");
      return;
    }

    const abi =
      '[{"inputs":[{"internalType":"uint256","name":"initNumber","type":"uint256"}],"stateMutability":"nonpayable","type":"constructor"},{"anonymous":false,"inputs":[{"indexed":false,"internalType":"uint256","name":"number","type":"uint256"}],"name":"SetNumber","type":"event"},{"inputs":[],"name":"increment","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"number","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"newNumber","type":"uint256"}],"name":"setNumber","outputs":[],"stateMutability":"nonpayable","type":"function"}]';
    // const contractAddr = "0x95Be48607498109030592C08aDC9577c7C2dD505"; //kairos
    const contractAddr = "0x5fC7cE838D28736B30Ca494B8189b68F8b82F170"; //mainnet
    const contract = new ethers.Contract(contractAddr, abi, provider);
    const contractCallData = await contract.increment.populateTransaction();

    const accountAddress = accounts[0];
    const tx = {
      typeInt: TxType.FeeDelegatedSmartContractExecution, // fee delegated smart contract execution
      from: accountAddress,
      to: contractCallData.to,
      input: contractCallData.data,
      value: "0x0",
      feePayer: "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
    };
    setScTx(tx);

    const userSignedTx = await provider.request({
      method: "kaia_signTransaction",
      params: [tx],
    });
    setFdsc(userSignedTx);
    const data = await requestFeeDelegation(userSignedTx);
    setScResult(data);
  };

  const feeDelegatedValueTransferWithMemo = async () => {
    if (!provider) {
      alert("Please connect wallet first");
      return;
    }

    const accountAddress = accounts[0];
    const tx = {
      typeInt: TxType.FeeDelegatedValueTransferMemo,
      from: accountAddress,
      to: accountAddress,
      value: "0x10",
      input: "0x1234567890abcdef",
      feePayer: "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
    };
    setVtmTx(tx);

    const userSignedTx = await provider.request({
      method: "kaia_signTransaction",
      params: [tx],
    });
    setFdvtm(userSignedTx);
    const data = await requestFeeDelegation(userSignedTx);
    setVtmResult(data);
  };

  return (
    <div className="flex flex-col gap-5 ml-10 mt-10">
      <div className="flex flex-row">
        <h1 className="font-extrabold">Fee Delegation Example Dapp</h1>
        <button
          onClick={connectWalletByDappPortalSDK}
          className="bg-slate-300 w-auto p-1 ml-5"
        >
          Connect Wallet
        </button>
      </div>
      <div className="flex flex-col">
        <div>
          <span>Fee Delegated Value Transfer</span>
          <button
            onClick={feeDelegatedValueTransfer}
            className="bg-slate-300  w-auto p-1 ml-5"
          >
            sign transaction
          </button>
        </div>
        <JSONPretty
          id="json-pretty"
          data={vtTx}
          className="bg-slate-100 my-2 p-2"
        ></JSONPretty>
        <span>signed rlp encoded tx:</span>
        <JSONPretty
          id="json-pretty"
          data={fdvt}
          className="bg-slate-100 my-2 p-2"
        ></JSONPretty>
        <span>Fee Delegated Value Transfer Result:</span>
        <JSONPretty
          id="json-pretty"
          data={vtResult}
          className="bg-slate-100 my-2 p-2"
        ></JSONPretty>
      </div>
      <div className="flex flex-col">
        <div>
          <span>Fee Delegated Value Transfer with memo</span>
          <button
            onClick={feeDelegatedValueTransferWithMemo}
            className="bg-slate-300  w-auto p-1 ml-5"
          >
            sign transaction
          </button>
        </div>
        <JSONPretty
          id="json-pretty"
          data={vtmTx}
          className="bg-slate-100 my-2 p-2"
        ></JSONPretty>
        <span>signed rlp encoded tx:</span>
        <JSONPretty
          id="json-pretty"
          data={fdvtm}
          className="bg-slate-100 my-2 p-2"
        ></JSONPretty>
        <span>Fee Delegated Value Transfer with memo Result:</span>
        <JSONPretty
          id="json-pretty"
          data={vtmResult}
          className="bg-slate-100 my-2 p-2"
        ></JSONPretty>
      </div>
      <div className="flex flex-col">
        <div>
          <span>Fee Delegated Smart Contract</span>
          <button
            onClick={feeDelegatedSmartContractExeuction}
            className="bg-slate-300 w-auto p-1 ml-5"
          >
            sign transaction
          </button>
        </div>
        <JSONPretty
          id="json-pretty"
          data={scTx}
          className="bg-slate-100 my-2 p-2"
        ></JSONPretty>
        <span>signed rlp encoded tx:</span>
        <JSONPretty
          id="json-pretty"
          data={fdsc}
          className="bg-slate-100 my-2 p-2"
        ></JSONPretty>
        <span>Fee Delegated Smart Contract Result:</span>
        <JSONPretty
          id="json-pretty"
          data={scResult}
          className="bg-slate-100 my-2 p-2"
        ></JSONPretty>
      </div>
    </div>
  );
}
