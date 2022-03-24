import { Box, ColumnConfig, Text, Tip } from "grommet";
import React, { useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import {
	getByteCodeSignatureByHash,
	getRelatedTransactionsByType,
	getRelatedTransactionsCountByType
} from "src/api/client";
import { TRelatedTransaction } from "src/api/client.interface";
import { TransactionsTable } from "src/components/tables/TransactionsTable";
import { Address, ASTRAValue, DateTime } from "src/components/ui";
import {
	Filter,
	RelatedTransaction,
	RelatedTransactionType,
	RPCTransactionAstra
} from "src/types";
import styled, { css } from "styled-components";
import { ExportToCsvButton } from "../../../components/ui/ExportToCsvButton";
import { getERC20Columns } from "./erc20Columns";

const TxMethod = styled(Text)`
	width: 100px;

	> div {
		display: block;
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}
`;

const Marker = styled.div<{ out: boolean }>`
	border-radius: 2px;
	padding: 5px;

	text-align: center;
	font-weight: bold;

	${(props) =>
		props.out
			? css`
					background: rgb(239 145 62);
					color: #fff;
			  `
			: css`
					background: rgba(105, 250, 189, 0.8);
					color: #1b295e;
			  `};
`;

const NeutralMarker = styled(Box)`
	border-radius: 2px;
	padding: 5px;

	text-align: center;
	font-weight: bold;
`;

const internalTxsBlocksFrom = 23000000;

function getColumns(id: string): ColumnConfig<any>[] {
	return [
		// {
		//   property: "type",
		//   size: "",
		//   header: (
		//     <Text
		//       color="minorText"
		//       size="small"
		//       style={{ fontWeight: 300, width: "140px" }}
		//     >
		//       Type
		//     </Text>
		//   ),
		//   render: (data: RelatedTransaction) => (
		//     <Text size="small" style={{ width: "140px" }}>
		//       {relatedTxMap[data.transactionType] || data.transactionType}
		//     </Text>
		//   ),
		// },
		{
			property: "hash",
			header: (
				<Text
					color="minorText"
					size="small"
					style={{ fontWeight: 300, width: "95px" }}
				>
					Hash
				</Text>
			),
			render: (data: any) => (
				<Address
					address={data.transactionHash || data.hash}
					type="tx"
					isShortEllipsis={true}
					style={{ width: "170px" }}
				/>
			),
		},
		{
			property: "method",
			header: (
				<Text color="minorText" size="small" style={{ fontWeight: 300 }}>
					Method
				</Text>
			),
			render: (data: any) => {
				let signature;

				try {
					// @ts-ignore
					signature =
						data.signatures &&
						data.signatures.map((s: any) => s.signature)[0].split("(")[0];
				} catch (err) {}

				if (!signature && data.value !== "0") {
					signature = "transfer";
				}

				if (!signature && data.input.length >= 10) {
					signature = data.input.slice(2, 10);
				}

				if (!signature) {
					return <Text size="small">{"—"}</Text>;
				}

				return (
					<Tip content={<span>{signature}</span>}>
						<TxMethod size="10px">
							<NeutralMarker background={"backgroundBack"}>
								{signature}
							</NeutralMarker>
						</TxMethod>
					</Tip>
				);
			},
		},
		// {
		//   property: "shard",
		//   header: (
		//     <Text color="minorText" size="small" style={{ fontWeight: 300 }}>
		//       Shard
		//     </Text>
		//   ),
		//   render: (data: RelatedTransaction) => (
		//     <Box direction="row" gap="3px" align="center">
		//       <Text size="small">{0}</Text>
		//       <FormNextLink
		//         size="small"
		//         color="brand"
		//         style={{ marginBottom: "2px" }}
		//       />
		//       <Text size="small">{0}</Text>
		//     </Box>
		//   ),
		// },
		{
			property: "from",
			header: (
				<Text
					color="minorText"
					size="small"
					style={{ fontWeight: 300, width: "180px" }}
				>
					From
				</Text>
			),
			render: (data: RelatedTransaction) => (
				<Text size="12px">
					<Address
						address={data.from}
						isShortEllipsis={true}
						style={{ width: "180px" }}
					/>
				</Text>
			),
		},
		{
			property: "marker",
			header: <></>,
			render: (data: RelatedTransaction) => (
				<Text size="12px">
					<Marker out={data.from === id}>
						{data.from === id ? "OUT" : "IN"}
					</Marker>
				</Text>
			),
		},
		{
			property: "to",
			header: (
				<Text
					color="minorText"
					size="small"
					style={{ fontWeight: 300, width: "180px" }}
				>
					To
				</Text>
			),
			render: (data: RelatedTransaction) => (
				<Text size="12px">
					<Address
						address={data.to}
						isShortEllipsis={true}
						style={{ width: "180px" }}
					/>
				</Text>
			),
		},
		{
			property: "value",
			header: (
				<Text
					color="minorText"
					size="small"
					style={{ fontWeight: 300, width: "120px" }}
				>
					Value
				</Text>
			),
			render: (data: RelatedTransaction) => (
				<Box justify="center">
					<ASTRAValue value={data.value} timestamp={data.timestamp} />
				</Box>
			),
		},

		{
			property: "timestamp",
			header: (
				<Text
					color="minorText"
					size="small"
					style={{ fontWeight: 300, width: "140px" }}
				>
					Timestamp
				</Text>
			),
			render: (data: RelatedTransaction) => (
				<Box direction="row" gap="xsmall" justify="end">
					<DateTime date={data.timestamp} />
				</Box>
			),
		},
	];
}

const getStackingColumns = (id: string): ColumnConfig<any>[] => {
	return [
		{
			property: "hash",
			header: (
				<Text
					color="minorText"
					size="small"
					style={{ fontWeight: 300, width: "95px" }}
				>
					Hash
				</Text>
			),
			render: (data: any) => (
				<Address
					address={data.transactionHash || data.hash}
					type="staking-tx"
					isShortEllipsis={true}
					style={{ width: "170px" }}
				/>
			),
		},
		{
			property: "type",
			header: (
				<Text
					color="minorText"
					size="small"
					style={{ fontWeight: 300, width: "140px" }}
				>
					Type
				</Text>
			),
			render: (data: RelatedTransaction) => (
				<Text size="small" style={{ width: "140px" }}>
					{data.type}
				</Text>
			),
		},
		{
			property: "validator",
			header: (
				<Text
					color="minorText"
					size="small"
					style={{ fontWeight: 300, width: "170px" }}
				>
					Validator
				</Text>
			),
			render: (data: RelatedTransaction) => (
				<Text size="12px">
					{data.msg?.validatorAddress ? (
						<Address
							address={data.msg?.validatorAddress || data.from}
							isShortEllipsis={true}
							style={{ width: "170px" }}
						/>
					) : (
						"—"
					)}
				</Text>
			),
		},
		{
			property: "marker",
			header: <></>,
			render: (data: RelatedTransaction) => (
				<Text size="12px">
					<Marker out={data.from === id}>
						{data.from === id ? "OUT" : "IN"}
					</Marker>
				</Text>
			),
		},
		{
			property: "delegator",
			header: (
				<Text
					color="minorText"
					size="small"
					style={{ fontWeight: 300, width: "170px" }}
				>
					Delegator
				</Text>
			),
			render: (data: RelatedTransaction) => (
				<Text size="12px">
					{data.msg?.delegatorAddress ? (
						<Address
							address={data.msg?.delegatorAddress}
							isShortEllipsis={true}
							style={{ width: "170px" }}
						/>
					) : (
						"—"
					)}
				</Text>
			),
		},
		{
			property: "value",
			header: (
				<Text
					color="minorText"
					size="small"
					style={{ fontWeight: 300, width: "220px" }}
				>
					Value
				</Text>
			),
			render: (data: RelatedTransaction) => (
				<Box justify="center">
					{data.msg?.amount ? (
						<ASTRAValue value={data.msg?.amount} timestamp={data.timestamp} />
					) : data.amount ? (
						<ASTRAValue value={data.amount} timestamp={data.timestamp} />
					) : (
						"—"
					)}
				</Box>
			),
		},
		{
			property: "timestamp",
			header: (
				<Text
					color="minorText"
					size="small"
					style={{ fontWeight: 300, width: "140px" }}
				>
					Timestamp
				</Text>
			),
			render: (data: RelatedTransaction) => (
				<Box direction="row" gap="xsmall" justify="end">
					<DateTime date={data.timestamp} />
				</Box>
			),
		},
	];
};

const relatedTxMap: Record<RelatedTransactionType, string> = {
	transaction: "Transaction",
	internal_transaction: "Internal Transaction",
	stacking_transaction: "Staking Transaction",
};

const usePrevious = (value: TRelatedTransaction) => {
	const ref = useRef();
	useEffect(() => {
		// @ts-ignore
		ref.current = value;
	});
	return ref.current;
};

export function Transactions(props: {
	type: TRelatedTransaction;
	rowDetails?: (row: any) => JSX.Element;
	onTxsLoaded?: (txs: RPCTransactionAstra[]) => void;
}) {
	const limitValue = localStorage.getItem("tableLimitValue");

	const initFilter: Filter = {
		offset: 0,
		limit: limitValue ? +limitValue : 10,
		orderBy: "block_number",
		orderDirection: "desc",
		filters: [{ type: "gte", property: "block_number", value: 0 }],
	};
	const initFilterState = {
		transaction: { ...initFilter },
		staking_transaction: { ...initFilter },
		internal_transaction: { ...initFilter },
		erc20: { ...initFilter },
		erc721: { ...initFilter },
		erc1155: { ...initFilter },
	};
	const initTotalElements = 100;
	const [cachedTxs, setCachedTxs] = useState<{
		[name: string]: RelatedTransaction[];
	}>({});
	const [relatedTrxs, setRelatedTrxs] = useState<RelatedTransaction[]>([]);
	const [totalElements, setTotalElements] = useState<number>(initTotalElements);
	const [cachedTotalElements, setCachedTotalElements] = useState<{
		[name: string]: number;
	}>({});
	const [filter, setFilter] =
		useState<{ [name: string]: Filter }>(initFilterState);
	const [isLoading, setIsLoading] = useState<boolean>(false);
	const prevType = usePrevious(props.type);

	// @ts-ignore
	let { id } = useParams();
	id = `${id}`.toLowerCase();
	const prevId = usePrevious(id);

	const { limit = 10, offset = 0 } = filter[props.type];

	const loadTransactions = async () => {
		setIsLoading(true);
		try {
			let txs = [];
			const txsFilter = { ...filter[props.type] };
			if (props.type === "internal_transaction") {
				txsFilter.filters = [
					{
						type: "gte",
						property: "block_number",
						value: internalTxsBlocksFrom,
					},
				];
			}
			txs = await getRelatedTransactionsByType([0, id, props.type, txsFilter]);
			// for transactions we display call method if any
			if (props.type === "transaction") {
				const methodSignatures = await Promise.all(
					txs.map((tx: any) => {
						return tx.input && tx.input.length > 10
							? getByteCodeSignatureByHash([tx.input.slice(0, 10)])
							: Promise.resolve([]);
					})
				);

				txs = txs.map((l, i) => ({
					...l,
					signatures: methodSignatures[i],
				}));
			}

			txs = txs.map((tx: any) => {
				tx.relatedAddress = id;
				return tx;
			});

			setRelatedTrxs(txs);
			if (props.onTxsLoaded) {
				props.onTxsLoaded(txs);
			}
		} catch (e) {
			console.error("Cannot get or parse txs:", e);
		} finally {
			setIsLoading(false);
		}
	};

	useEffect(() => {
		setCachedTxs({});
		setCachedTotalElements({});
		setFilter(initFilterState);
	}, [id]);

	useEffect(() => {
		const getTxsCount = async () => {
			try {
				const countFilter = { ...filter[props.type] };
				// Note: internal_transactions index from & to supported only for block_number >= internalTxsBlocksFrom
				if (props.type === "internal_transaction") {
					countFilter.filters = [
						{
							type: "gte",
							property: "block_number",
							value: internalTxsBlocksFrom,
						},
					];
				}
				const txsCount = await getRelatedTransactionsCountByType([
					0,
					id,
					props.type,
					countFilter,
				]);
				setTotalElements(txsCount);
				setCachedTotalElements({
					...cachedTotalElements,
					[props.type]: txsCount,
				});
			} catch (e) {
				console.error("Cannot get txs count", (e as Error).message);
				setTotalElements(initTotalElements);
			}
		};
		const cachedValue = cachedTotalElements[props.type];
		if (cachedValue) {
			setTotalElements(cachedValue);
		} else {
			getTxsCount();
		}
	}, [props.type, id]);

	useEffect(() => {
		if (prevType === props.type) {
			loadTransactions();
		}
	}, [filter[props.type], id]);

	useEffect(() => {
		if (cachedTxs[props.type]) {
			setRelatedTrxs(cachedTxs[props.type]);
		} else {
			loadTransactions();
		}
	}, [props.type]);

	let columns = [];

	switch (props.type) {
		case "staking_transaction": {
			columns = getStackingColumns(id);
			break;
		}
		case "erc20": {
			columns = getERC20Columns(id);
			break;
		}

		default: {
			columns = getColumns(id);
			break;
		}
	}

	return (
		<Box style={{ padding: "10px" }}>
			<TransactionsTable
				columns={columns}
				data={relatedTrxs}
				totalElements={totalElements}
				limit={+limit}
				filter={filter[props.type]}
				isLoading={isLoading}
				setFilter={(value) => {
					if (value.limit !== filter[props.type].limit) {
						localStorage.setItem("tableLimitValue", `${value.limit}`);
					}
					setFilter({ ...filter, [props.type]: value });
				}}
				noScrollTop
				minWidth="1266px"
				hideCounter
				rowDetails={props.rowDetails}
				showPages={totalElements > 0}
			/>
			{props.type === "transaction" && (
				<Box style={{ alignItems: "flex-end" }}>
					<ExportToCsvButton address={id} type={"transactions"} />
				</Box>
			)}
		</Box>
	);
}
