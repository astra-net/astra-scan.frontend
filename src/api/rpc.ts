import { ERC1155_Pool } from "src/hooks/ERC1155_Pool";
import { ERC20_Pool } from "src/hooks/ERC20_Pool";
import { ERC721_Pool } from "src/hooks/ERC721_Pool";
import { AstraAddress } from "src/utils";
import {
	convertTxnToObj,
	filterTransactions,
	hasAllowance,
	matchesApprovalMethod
} from "src/utils/approvals";
import {
	ApprovalDetails,
	IGetTxsHistoryParams,
	RequestOrder,
	RequestTxType,
	RPCTransactionAstra,
	TokenType
} from "../types";

export type TRPCResponse<T> = {
	id: number;
	jsonrpc: "2.0";
	result: T;
	error?: { code: number; message: string };
};

const API_URL =
	process.env.REACT_APP_RPC_URL_SHARD0 || "https://a.api.s0.t.hmny.io/";

export const rpcAdapter = <T = any>(...args: Parameters<typeof fetch>) => {
	/**
	 * wrapper for fetch. for some middleware in future requests
	 */

	return fetch
		.apply(window, args)
		.then((res) => res.json()) as unknown as Promise<T>;
};

export const getBalance = (params: [string, "latest"]) => {
	return rpcAdapter<TRPCResponse<string>>(API_URL, {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify({
			jsonrpc: "2.0",
			method: "eth_getBalance",
			id: 1,
			params,
		}),
	});
};

export const astrav2_getTransactionReceipt = (
	params: [string],
	shardNumber: number
) => {
	return rpcAdapter<
		TRPCResponse<{ logs: [{ data: string }]; gasUsed: string }>
	>(process.env[`REACT_APP_RPC_URL_SHARD${shardNumber}`] as string, {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify({
			jsonrpc: "2.0",
			method: "astrav2_getTransactionReceipt",
			id: 1,
			params,
		}),
	});
};

export const getAllBalance = (params: [string, "latest"]) => {
	return Promise.all([
		rpcAdapter<TRPCResponse<string>>(
			`${process.env["REACT_APP_RPC_URL_SHARD0"]}`,
			{
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					jsonrpc: "2.0",
					method: "eth_getBalance",
					id: 1,
					params,
				}),
			}
		),
		rpcAdapter<TRPCResponse<string>>(
			`${process.env["REACT_APP_RPC_URL_SHARD1"]}`,
			{
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					jsonrpc: "2.0",
					method: "eth_getBalance",
					id: 1,
					params,
				}),
			}
		),
		rpcAdapter<TRPCResponse<string>>(
			`${process.env["REACT_APP_RPC_URL_SHARD2"]}`,
			{
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					jsonrpc: "2.0",
					method: "eth_getBalance",
					id: 1,
					params,
				}),
			}
		),
		rpcAdapter<TRPCResponse<string>>(
			`${process.env["REACT_APP_RPC_URL_SHARD3"]}`,
			{
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					jsonrpc: "2.0",
					method: "eth_getBalance",
					id: 1,
					params,
				}),
			}
		),
	]).then((arr) => {
		return Promise.resolve(arr.map((item) => item.result));
	});
};

const defaultGetHistoryParams = {
	fullTx: true,
	txType: RequestTxType.ALL,
	order: RequestOrder.DESC,
};

export const astrav2_getTransactionsHistory = (
	params: IGetTxsHistoryParams[]
) => {
	return rpcAdapter<TRPCResponse<{ transactions: RPCTransactionAstra[] }>>(
		API_URL,
		{
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({
				jsonrpc: "2.0",
				method: "astrav2_getTransactionsHistory",
				id: 1,
				params: [{ ...defaultGetHistoryParams, ...params[0] }],
			}),
		}
	).then((data) => {
		if (data.error) {
			throw new Error(data.error.message);
		}
		return data.result.transactions;
	});
};

export const astrav2_getTransactionsCount = (
	address: string,
	txType: RequestTxType = RequestTxType.ALL
) => {
	return rpcAdapter<TRPCResponse<number>>(API_URL, {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify({
			jsonrpc: "2.0",
			method: "astrav2_getTransactionsCount",
			id: 1,
			params: [address, txType],
		}),
	}).then((data) => {
		if (data.error) {
			throw new Error(data.error.message);
		}
		return data.result;
	});
};

export const astrav2_getStakingTransactionsHistory = (
	params: IGetTxsHistoryParams[]
) => {
	return rpcAdapter<
		TRPCResponse<{ staking_transactions: RPCTransactionAstra[] }>
	>(API_URL, {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify({
			jsonrpc: "2.0",
			method: "astrav2_getStakingTransactionsHistory",
			id: 1,
			params: [{ ...defaultGetHistoryParams, ...params[0] }],
		}),
	}).then((data) => {
		if (data.error) {
			throw new Error(data.error.message);
		}
		return data.result.staking_transactions;
	});
};

export const astrav2_getStakingTransactionsCount = (
	address: string,
	txType: RequestTxType = RequestTxType.ALL
) => {
	return rpcAdapter<TRPCResponse<number>>(API_URL, {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify({
			jsonrpc: "2.0",
			method: "astrav2_getStakingTransactionsCount",
			id: 1,
			params: [address, txType],
		}),
	}).then((data) => {
		if (data.error) {
			throw new Error(data.error.message);
		}
		return data.result;
	});
};

/**
 * Given address get all the approvals made by this address for all types of ERC1155, ERC721, and ERC20 tokens.
 * Supply optional contractAddress argument to filter to only the specified token.
 *
 * Use pageIndex and pageSize to control how many events to load from the RPC, supply txnHistory to remove previous
 *
 * @param address
 * @param contractAddress
 * @param pageIndex
 * @param pageSize
 * @param txnHistory
 */
export const getAllApprovalsForTokens = async (
	address: string,
	contractAddress: string = "",
	pageIndex = 0,
	pageSize = 100,
	txnHistory: any[] = [],
	erc20Pool: ERC20_Pool = {},
	erc1155Pool: ERC1155_Pool = {},
	erc721Pool: ERC721_Pool = {}
): Promise<{
	txnHistory: ApprovalDetails[];
	dataObj: RPCTransactionAstra[];
}> => {
	const params: IGetTxsHistoryParams[] = [
		{
			address,
			pageIndex,
			pageSize,
			fullTx: true,
			txType: RequestTxType.SENT,
			order: RequestOrder.ASC,
		},
	];

	// if null, return all approvals
	const contractAstraAddr =
		contractAddress && contractAddress.length > 0
			? new AstraAddress(contractAddress)
			: null;

	let dataObj: RPCTransactionAstra[] = await astrav2_getTransactionsHistory(
		params
	);

	for (let tx of dataObj) {
		if (
			matchesApprovalMethod(tx) &&
			(tx.to === contractAddress ||
				tx.to === contractAstraAddr?.raw ||
				!contractAstraAddr)
		) {
			const spender = "0x" + tx.input.substring(34, 74);
			const to = new AstraAddress(tx.to).basicHex;
			let type: TokenType = "ERC20";
			if (erc1155Pool[to]) {
				type = "ERC1155";
			} else if (erc721Pool[to]) {
				type = "ERC721";
			}
			// remove from list
			txnHistory = filterTransactions(
				tx,
				txnHistory,
				spender,
				erc20Pool,
				erc1155Pool,
				erc721Pool
			);
			//txnHistory.filter(transaction => !(transaction.spender === spender && transaction.contract === tx.to)) // remove from list txn spender AND contract matches...
			if (hasAllowance(tx, spender, type)) {
				const approvedObj = convertTxnToObj(tx, type);
				txnHistory.push(approvedObj);
			}
		}
	}

	return { txnHistory, dataObj };
};
