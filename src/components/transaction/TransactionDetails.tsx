import { Anchor, Box, DataTable, Tip } from "grommet";
import { CaretDownFill, CaretUpFill, CircleQuestion } from "grommet-icons";
import React, { FunctionComponent, useState } from "react";
import { TransactionSubType } from "src/components/transaction/helpers";
import {
	CalculateFee,
	CalculateTransactionFee,
	TipContent,
} from "src/components/ui";
import { IHexSignature, Log, RPCStakingTransactionAstra } from "src/types";
import { TxStatusComponent } from "../ui/TxStatusComponent";
import {
	transactionDisplayValues,
	transactionPropertyDescriptions,
	transactionPropertyDisplayNames,
	transactionPropertySort,
} from "./helpers";
// import {tokenTransfersERC721} from './tokenTransfer/tokenTransfersERC721'
import { TokenTransfersERC1155 } from "./tokenTransfer/tokenTransfersERC1155";
import { tokenTransfersERC20 } from "./tokenTransfer/tokenTransfersERC20";

const getColumns = ({ type = "" }) => [
	{
		property: "key",
		render: (e: any) => (
			<div>
				<Tip
					dropProps={{ align: { left: "right" } }}
					content={
						<TipContent
							message={
								transactionPropertyDescriptions[e.key + type] ||
								transactionPropertyDescriptions[e.key]
							}
						/>
					}
					plain
				>
					<span>
						<CircleQuestion size="small" />
					</span>
				</Tip>
				&nbsp;
				{transactionPropertyDisplayNames[e.key + type] ||
					transactionPropertyDisplayNames[e.key] ||
					e.key}
			</div>
		),
		size: "1/3",
	},
	{
		property: "value",
		size: "2/3",
		render: (e: any) => e.value,
	},
];

type TransactionDetailsProps = {
	internalTxs?: any[];
	transaction: RPCStakingTransactionAstra;
	inputSignature?: IHexSignature;
	type?: TransactionSubType;
	stakingData?: boolean;
	logs?: Log[];
	errorMsg: string | undefined;
	shorMoreHide?: boolean;
};

type tableEntry = {
	key: string;
	value: any;
};

// todo move out to a service to support any custom ABI

const tokenTransfers = (logs: Log[]) => {
	return (
		<>
			{tokenTransfersERC20(logs)}
			{TokenTransfersERC1155(logs)}
		</>
	);
};

export const TransactionDetails: FunctionComponent<TransactionDetailsProps> = ({
	transaction,
	type,
	logs = [],
	errorMsg,
	shorMoreHide,
	stakingData,
	internalTxs = [],
	inputSignature,
}) => {
	const [showDetails, setShowDetails] = useState(false);

	const newTransaction = {
		Status:
			errorMsg === undefined ? (
				+transaction.shardID > 0 ? (
					<TxStatusComponent msg={""} />
				) : (
					<> </>
				)
			) : (
				<TxStatusComponent msg={errorMsg} />
			),
		...transaction,
		tokenTransfers: tokenTransfers(logs),
		transactionFee: (
			<Box justify="center">{CalculateTransactionFee(transaction)}</Box>
		),
		gasUsed: <Box justify="center">{transaction.gas}</Box>,
		gasPrice: <Box justify="center">{CalculateFee(transaction)}</Box>,
	};

	const keys = Object.keys(newTransaction).filter((key) => {
		if (stakingData) {
			return (
				["tokenTransfers", "transactionFee", "gasPrice", "Status"].indexOf(
					key
				) === -1
			);
		} else {
			return key !== "gas";
		}
	});
	const sortedKeys = keys
		.sort((a, b) => transactionPropertySort[b] - transactionPropertySort[a])
		.filter((k) => showDetails || ["r", "s", "v"].indexOf(k) === -1);

	const txData = sortedKeys.reduce((arr, key) => {
		// @ts-ignore
		const value = transactionDisplayValues(
			// @ts-ignore
			newTransaction,
			key,
			// @ts-ignore
			newTransaction[key],
			type,
			internalTxs,
			inputSignature
		);

		if (value === undefined) {
			return arr;
		}

		arr.push({ key, value } as tableEntry);
		return arr;
	}, [] as tableEntry[]);

	const value = internalTxs;

	return (
		<>
			<Box flex align="start" justify="start" style={{ overflow: "auto" }}>
				<DataTable
					className={"g-table-body-last-col-right g-table-no-header"}
					style={{ width: "100%", minWidth: "698px" }}
					columns={getColumns({ type })}
					data={txData}
					step={10}
					border={{
						header: {
							color: "none",
						},
						body: {
							color: "border",
							side: "top",
							size: "1px",
						},
					}}
				/>
			</Box>
			{shorMoreHide ? null : (
				<Box align="center" justify="center" style={{ userSelect: "none" }}>
					<Anchor
						onClick={() => setShowDetails(!showDetails)}
						margin={{ top: "medium" }}
					>
						{showDetails ? (
							<>
								Show less&nbsp;
								<CaretUpFill size="small" />
							</>
						) : (
							<>
								Show more&nbsp;
								<CaretDownFill size="small" />
							</>
						)}
					</Anchor>
				</Box>
			)}
		</>
	);
};
