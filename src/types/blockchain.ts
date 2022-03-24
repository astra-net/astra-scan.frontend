export type RPCETHMethod =
	| "eth_getBlockByNumber"
	| "eth_getTransactionByHash"
	| "eth_getLogs"
	| "eth_getBlocks"
	| "trace_block";

export type RPCAstraMethod =
	| "astra_getBlockByNumber"
	| "astra_getTransactionByHash"
	| "astra_getBlocks"
	| "debug_traceTransaction";

export type ShardID = 0 | 1 | 2 | 3;

export type BlockHexNumber = string;
export type BlockHash = string;
export type BlockNumber = number;

export type RPCBlock = {
	difficulty: string;
	extraData: string;
	gasLimit: string;
	gasUsed: string;
	hash: BlockHash;
	logsBloom: LogsBloom;
	miner: string;
	mixHash: string;
	nonce: string;
	number: BlockHexNumber;
	parentHash: string;
	receiptsRoot: string;
	sha3Uncles: string;
	size: string;
	stateRoot: string;
	timestamp: string;
	transactions: RPCTransaction[];
	transactionsRoot: string;
	uncles: string[];
};

export type LogsBloom = string;

export type TokenType = "ERC20" | "ERC1155" | "ERC721";

export type RPCBlockAstra = {
	difficulty: string;
	extraData: string;
	gasLimit: string;
	gasUsed: string;
	hash: BlockHash;
	logsBloom: LogsBloom;
	miner: string;
	mixHash: string;
	nonce: string;
	number: BlockHexNumber;
	parentHash: string;
	receiptsRoot: string;
	sha3Uncles: string | null;
	size: string;
	stateRoot: string;
	timestamp: string;
	transactions: RPCTransactionAstra[];
	stakingTransactions: RPCStakingTransactionAstra[];
	transactionsRoot: string;
	uncles: string[];
	epoch: string;
	viewID: string;
};

type Modify<T, R> = Omit<T, keyof R> & R;

export type Block = Modify<
	RPCBlockAstra,
	{
		number: string;
		epoch: string;
		difficulty: string;
		gasLimit: string;
		gasUsed: string;
		nonce: string;
		size: string;
		shardNumber?: number;
	}
>;

export type Address = string;
export type AddressAstra = string;

export type TransactionHash = string;
export type TransactionAstraHash = string;

export type RPCTransaction = {
	blockHash: BlockHash;
	blockNumber: BlockHexNumber;
	from: Address;
	to: Address;
	gas: string;
	gasPrice: string;
	hash: TransactionHash;
	input: ByteCode;
	nonce: string;
	r: string;
	s: string;
	timestamp: string;
	transactionIndex: string;
	v: string;
	value: string;
};

export type RPCTransactionAstra = {
	blockHash: BlockHash;
	blockNumber: BlockHexNumber;
	from: AddressAstra;
	to: AddressAstra;
	gas: string;
	gasPrice: string;
	hash: TransactionAstraHash;
	ethHash: TransactionHash;
	input: ByteCode;
	nonce: string;
	r: string;
	s: string;
	shardID: ShardID;
	timestamp: string;
	toShardID: ShardID;
	transactionIndex: string;
	v: string;
	value: string;
};
export type StakingTransactionType =
	| "CreateValidator"
	| "EditValidator"
	| "CollectRewards"
	| "Undelegate"
	| "Delegate";

export type RPCStakingTransactionAstra = {
	type: StakingTransactionType;
	blockHash: BlockHash;
	blockNumber: BlockHexNumber;
	from: AddressAstra;
	to: AddressAstra;
	gas: string;
	gasPrice: string;
	gasLimit: string;
	hash: TransactionAstraHash;
	input: ByteCode;
	nonce: string;
	r: string;
	s: string;
	shardID: ShardID;
	timestamp: string;
	toShardID: ShardID;
	transactionIndex: string;
	v: string;
	msg: any; // todo
	amount?: string;
};

// todo
export type StakingTransaction = RPCStakingTransactionAstra;

export type Topic = string;
export type ByteCode = string;

export type Log = {
	address: Address;
	topics: Topic[];
	data: ByteCode;
	blockNumber: BlockHexNumber;
	transactionHash: TransactionHash;
	transactionIndex: string;
	blockHash: BlockHash;
	logIndex: string;
	removed: boolean;
};

export interface LogDetailed extends Log {
	input: string;
	timestamp: string;
}

export type TraceCallTypes =
	| "CALL"
	| "STATICCALL"
	| "CREATE"
	| "CREATE2"
	| "DELEGATECALL";

// how to extract see explorer-dashboard
export type TraceCallErrorToRevert = string;

export type RPCInternalTransactionFromBlockTrace = {
	result?: {
		gasUsed: string;
		output: ByteCode;
	};
	action: {
		callType: TraceCallTypes;
		from: Address;
		gas: string;
		input: ByteCode;
		to: Address;
		value: string;
	};
	blockHash: BlockHash;
	blockNumber: BlockNumber;
	transactionHash: TransactionHash;
	traceAddress: number[];
	type: TraceCallTypes;
};

export type InternalTransaction = {
	error?: TraceCallErrorToRevert;
	index: number;
	from: Address;
	to: Address;
	gas: string;
	gasUsed: string;
	input: ByteCode;
	output: ByteCode;
	time: string;
	type: TraceCallTypes;
	value: string;
	blockHash: BlockHash;
	blockNumber: BlockNumber;
	transactionHash: TransactionHash;
	signatures?: any[];
};

export type Transaction = {
	astra: RPCTransactionAstra;
	eth: RPCTransaction;
};

export type AddressTransactionType =
	| "transaction"
	| "staking_transaction"
	| "internal_transaction";
export type Address2Transaction = {
	blockNumber: BlockNumber;
	transactionHash: TransactionHash | TransactionAstraHash;
	address: Address;
	transactionType: AddressTransactionType;
};

export interface RelatedTransaction {
	transactionType: RelatedTransactionType;
	address: string;
	blockNumber: string;
	transactionHash: string;
	from: string;
	to: string;
	value: string;
	timestamp: string;
	type?: string;
	msg?: { amount: string; delegatorAddress: string; validatorAddress: string };
	amount?: string;
}

export type RelatedTransactionType =
	| "transaction"
	| "internal_transaction"
	| "stacking_transaction";

export interface AddressDetails {
	creator_address: string;
	solidityVersion: string;
	ipfs_hash?: string;
	meta?: { name?: string; image?: string };
	bytecode: string;
	IPFSHash?: string;
}

export interface IHexSignature {
	hash: string;
	signature: string;
}

// tokenAmount is erc20 token amount approved (allowance)
// tokenId is any specific token approved for this txn (or null if not approved)
// NOTE: tokenId of 0 may be valid, check undefined/null status!!
export interface ApprovalDetails {
	hash: string;
	lastUpdated: Date;
	assetAddress: string;
	spender: string;
	allowance: string;
	action: string;
	account: string;
	contract: string;
	tokenAmount?: number;
	tokenId?: number;
	type: TokenType;
	isFullApproval?: boolean;
}
