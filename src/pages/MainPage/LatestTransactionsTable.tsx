import { Box, DataTable, Spinner, Text } from "grommet";
import { FormNextLink } from "grommet-icons";
import React, { useEffect, useState } from "react";
import { useHistory } from "react-router-dom";
import { getTransactions } from "src/api/client";
import { Address } from "src/components/ui";
import { getTabHidden, useWindowFocused } from "src/hooks/useWindowFocusHook";
import { RPCTransactionAstra } from "src/types";
import { DateTime } from "../../components/ui";

function getColumns(props: any) {
	const { history } = props;
	return [
		{
			property: "shard",
			header: (
				<Text color="minorText" size="small" style={{ fontWeight: 300 }}>
					Shard
				</Text>
			),
			render: (data: RPCTransactionAstra) => (
				<Box direction="row" gap="3px" align="center">
					<Text size="small">{data.shardID}</Text>
					<FormNextLink
						size="small"
						color="brand"
						style={{ marginBottom: "2px" }}
					/>
					<Text size="small">{data.toShardID}</Text>
				</Box>
			),
		},
		{
			property: "hash",
			header: (
				<Text color="minorText" size="small" style={{ fontWeight: 300 }}>
					Hash
				</Text>
			),
			render: (data: RPCTransactionAstra) => (
				<Text size="small" style={{ cursor: "pointer" }} color="brand">
					<Address
						type={"tx"}
						address={data.hash}
						isShort
						noHistoryPush
						hideCopyBtn
					/>
				</Text>
			),
		},
		{
			property: "from",
			header: (
				<Text color="minorText" size="small" style={{ fontWeight: 300 }}>
					From
				</Text>
			),
			render: (data: RPCTransactionAstra) => (
				<Address address={data.from} isShort hideCopyBtn />
			),
		},
		{
			property: "to",
			header: (
				<Text color="minorText" size="small" style={{ fontWeight: 300 }}>
					To
				</Text>
			),
			render: (data: RPCTransactionAstra) => (
				<Address address={data.to} isShort hideCopyBtn />
			),
		},
		{
			property: "age",
			header: (
				<Text color="minorText" size="small" style={{ fontWeight: 300 }}>
					Timestamp
				</Text>
			),
			render: (data: RPCTransactionAstra) => (
				<DateTime date={new Date(data.timestamp)} />
			),
		},
	];
}

const filter = {
	offset: 0,
	limit: 10,
	orderBy: "block_number",
	orderDirection: "desc",
	value: 0,
	filters: [],
};

export function LatestTransactionsTable() {
	const hidden = useWindowFocused();

	const history = useHistory();
	const [transactions, setTransactions] = useState<RPCTransactionAstra[]>([]);
	const availableShards = (process.env.REACT_APP_AVAILABLE_SHARDS as string)
		.split(",")
		.map((t) => +t);

	useEffect(() => {
		let tId = 0 as any;
		const exec = async () => {
			try {
				const hidden = getTabHidden();
				if (hidden) {
					// tab is not focused
					return;
				}
				let trxs = await Promise.all(
					availableShards.map((shardNumber) =>
						getTransactions([shardNumber, filter])
					)
				);

				const trxsList = trxs.reduce((prev, cur) => {
					prev = [...prev, ...cur];
					return prev;
				}, []);

				setTransactions(
					trxsList
						.sort((a, b) => (a.timestamp < b.timestamp ? 1 : -1))
						.slice(0, 10) as RPCTransactionAstra[]
				);
			} catch (err) {
				console.log(err);
			}
		};

		exec();
		tId = window.setInterval(exec, 3000);

		return () => {
			clearTimeout(tId);
		};
	}, []);

	if (!transactions.length) {
		return (
			<Box style={{ height: "700px" }} justify="center" align="center">
				<Spinner />
			</Box>
		);
	}

	return (
		<Box style={{ overflow: "auto" }}>
			<DataTable
				className={"g-table-header"}
				style={{ width: "100%", minWidth: "620px" }}
				columns={getColumns({ history })}
				data={transactions}
				step={10}
				border={{
					header: {
						color: "brand",
					},
					body: {
						color: "border",
						side: "top",
						size: "1px",
					},
				}}
			/>
		</Box>
	);
}
