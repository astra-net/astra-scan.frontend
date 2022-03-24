import dayjs from "dayjs";
import { bridgeTokensMap } from "src/config";
import {
	RelatedTransaction,
	RelatedTransactionType,
	RPCTransactionAstra,
} from "../types";
import { getAddress } from "./getAddress/GetAddress";

export const getQueryVariable = (variable: string, query: string) => {
	const vars = query.split("&");
	for (let i = 0; i < vars.length; i++) {
		const pair = vars[i].split("=");
		if (decodeURIComponent(pair[0]) == variable) {
			return decodeURIComponent(pair[1]);
		}
	}
};

export const mapBlockchainTxToRelated = (
	tx: RPCTransactionAstra,
	type: RelatedTransactionType = "transaction"
): RelatedTransaction => {
	const resultedTx = {
		...tx,
		transactionType: type,
		address: "",
		transactionHash: tx.ethHash || tx.hash,
		timestamp: dayjs(+tx.timestamp * 1000).toString(),
	};
	if (tx.from) {
		resultedTx.from = getAddress(tx.from).basicHex;
	}
	if (tx.to) {
		resultedTx.to = getAddress(tx.to).basicHex;
	}
	if (typeof tx.value !== "undefined") {
		resultedTx.value = BigInt(tx.value).toString();
	}
	return resultedTx;
};

export const isTokenBridged = (address: string) => !!bridgeTokensMap[address];

export const copyTextToClipboard = (value: string) => {
	const copyTextareaInput = document.createElement("textarea");
	copyTextareaInput.value = value;
	document.body.appendChild(copyTextareaInput);

	copyTextareaInput.focus();
	copyTextareaInput.select();

	try {
		document.execCommand("copy");
	} catch {
	} finally {
		document.body.removeChild(copyTextareaInput);
	}
};
