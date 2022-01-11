/// <reference types="node" />
import { Buffer } from 'buffer';
export declare const encode: (input: any) => Buffer;
export declare const decode: (input: any, stream: any) => any;
export declare const getLength: (input: any) => number | Buffer;
export declare const toBuffer: (v: any) => Buffer;
export interface TransactionResultResponse {
    status: string;
    status_code: number;
    error_message: string;
    events: Array<Event>;
}
export interface Event {
    type: string;
    transaction_id: Buffer;
    transaction_index: number;
    event_index: number;
    payload: EventPayload;
}
export interface EventPayload {
    event: string;
    value: {
        id: string;
        fields: Array<{
            name: string;
            value: {
                type: string;
                value: any;
            };
        }>;
    };
}
export interface FlowKey {
    keyID: number;
    private: string;
    public: string;
}
export interface AddKey {
    public: string;
    weight: number;
}
export interface Account {
    address: Buffer;
    balance: number;
    code: Buffer;
    keys: Array<AccountKey>;
    contracts: Object;
}
export interface Block {
    id: Buffer;
    parent_id: Buffer;
    height: number;
    timestamp: Timestamp;
    collection_guarantees: Array<CollectionGuarantee>;
    block_seals: Array<BlockSeal>;
    signatures: Array<Buffer>;
}
export interface Timestamp {
    seconds: number;
    nanos: number;
}
export interface CollectionGuarantee {
    collection_id: Buffer;
    signatures: Array<Buffer>;
}
export interface BlockSeal {
    block_id: Buffer;
    execution_receipt_id: Buffer;
    execution_receipt_signatures: Array<Buffer>;
    result_approval_signatures: Array<Buffer>;
}
export interface AccountKey {
    id: number;
    public_key: Buffer;
    sign_algo: number;
    hash_algo: number;
    weight: number;
    sequence_number: number;
    revoked: Boolean;
}
export interface Transaction {
    script: Buffer;
    arguments: Array<Buffer>;
    reference_block_id: Buffer;
    gas_limit: number;
    proposal_key: TransactionProposalKey;
    payer: Buffer;
    authorizers: Array<Buffer>;
    payload_signatures: Array<TransactionSignature>;
    envelope_signatures: Array<TransactionSignature>;
}
export interface TransactionProposalKey {
    address: Buffer;
    key_id: number;
    sequence_number: number;
}
export interface Proposal {
    address: Buffer;
    privateKey: string;
    publicKey: string;
}
export interface TransactionSignature {
    address: Buffer;
    key_id: number;
    signature: Buffer;
}
export interface Sign {
    address: string;
    key_id: number;
    private_key: string;
}
export declare enum TransactionStatus {
    UNKNOWN = 0,
    PENDING = 1,
    FINALIZED = 2,
    EXECUTED = 3,
    SEALED = 4,
    EXPIRED = 5
}
export interface Keys {
    public: string;
    private: string;
}
export declare enum FlowNetwork {
    EMULATOR = 0,
    TESTNET = 1,
    MAINNET = 2
}
export declare class Flow {
    private serviceAccountAddress;
    private network;
    private privateKeys;
    private workers;
    private work;
    private dbg;
    private error;
    private shutdown;
    private tickTimeout;
    private processing;
    constructor(network: FlowNetwork | string, serviceAccountAddress: string, privateKeys: Array<FlowKey>, tick?: number);
    start(): Promise<void>;
    private tick;
    stop(): void;
    get_account(accountAddress: string, blockHeight?: number): Promise<Account | Error>;
    execute_script(script: string, arg: any[]): Promise<any>;
    execute_transaction(script: string, arg: any[], authorizers?: Array<Proposal>, proposer?: Proposal, payer?: Proposal): Promise<TransactionResultResponse | Error>;
    create_account(newAccountKeys?: Array<AddKey | string>): Promise<TransactionResultResponse | Error>;
    add_contract(contractName: string, contract: string, account: Proposal): Promise<TransactionResultResponse | Error>;
    add_key(key: AddKey, account: Proposal): Promise<TransactionResultResponse | Error>;
    remove_key(keyIndex: number, account: Proposal): Promise<TransactionResultResponse | Error>;
    update_contract(contractName: string, contract: string, account: Proposal): Promise<TransactionResultResponse | Error>;
    remove_contract(contractName: string, account: Proposal): Promise<TransactionResultResponse | Error>;
    get_block(blockId?: string, blockHeight?: number, sealed?: boolean): Promise<Block | Error>;
}
