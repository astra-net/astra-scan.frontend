import { Box, Text } from "grommet";
import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { getStakingTransactionByField } from "src/api/client";
import { astrav2_getTransactionReceipt } from "src/api/rpc";
import { TransactionSubType } from "src/components/transaction/helpers";
import { TransactionDetails } from "src/components/transaction/TransactionDetails";
import { BasePage } from "src/components/ui";
import { RPCStakingTransactionAstra, StakingTransactionType } from "src/types";

export const StakingTransactionPage = () => {
	// @ts-ignore
	const { id } = useParams();
	const [tx, setTx] = useState<RPCStakingTransactionAstra | null>(null);

	const availableShards = (process.env.REACT_APP_AVAILABLE_SHARDS as string)
		.split(",")
		.map((t) => +t);

	useEffect(() => {
		const exec = async () => {
			let tx;
			let shardNumber = 0;
			if (id.length === 66) {
				tx = await getStakingTransactionByField([0, "hash", id]);

				if (!tx && availableShards.find((i) => i === 1)) {
					shardNumber = 1;
					tx = await getStakingTransactionByField([1, "hash", id]);
				}

				if (!tx && availableShards.find((i) => i === 2)) {
					shardNumber = 2;
					tx = await getStakingTransactionByField([2, "hash", id]);
				}

				if (!tx && availableShards.find((i) => i === 3)) {
					shardNumber = 3;
					tx = await getStakingTransactionByField([3, "hash", id]);
				}

				if (tx.type === "CollectRewards" && tx.amount === null) {
					try {
						tx.amount = await (
							await astrav2_getTransactionReceipt([id], shardNumber)
						).result.logs[0].data;
					} catch {}
				}
			}
			setTx(tx as RPCStakingTransactionAstra);
		};
		exec();
	}, [id]);

	if (!tx) {
		return null;
	}

	const { amount, ...restTx } = tx;

	const { amount: amountMsg, ...restTxMsg } = tx.msg || {};

	return (
		<BasePage>
			<Box border={{ size: "xsmall", side: "bottom", color: "border" }}>
				<Text size="large" weight="bold" margin={{ bottom: "small" }}>
					Staking Transaction
				</Text>
			</Box>

			<TransactionDetails transaction={restTx} type="__staking" errorMsg={""} />
			<Box
				margin={{ top: "medium" }}
				pad={{ bottom: "small" }}
				border={{ size: "xsmall", side: "bottom", color: "border" }}
			>
				<Text size="large">Staking Data</Text>
			</Box>
			<TransactionDetails
				transaction={
					tx.type === "CollectRewards"
						? {
								...tx.msg,
								amount: amount,
						  }
						: tx.type === "EditValidator"
						? restTxMsg
						: tx.msg
				}
				type={subTypeMap[tx.type] || ""}
				stakingData
				errorMsg={""}
				shorMoreHide={true}
			/>
		</BasePage>
	);
};

const subTypeMap: Record<StakingTransactionType, TransactionSubType> = {
	Delegate: "__delegated",
	Undelegate: "__undelegated",
	CollectRewards: "",
	CreateValidator: "",
	EditValidator: "",
};
