import 'jest';
import { Flow, FlowNetwork, AccountKey, TransactionResultResponse } from '@marshallbelles/flow-ts';
import * as fs from 'fs';
import { exec, ChildProcess } from 'child_process';
import { gzip, gunzip } from 'zlib';

describe('ContractTesting', () => {
    let flow: Flow;
    let svc: AccountKey;
    let usr1: AccountKey;
    let usr2: AccountKey;
    let emulator: ChildProcess;

    beforeAll(async () => {
        // start emulator
        emulator = exec('flow emulator');
        // wait 1 second
        await new Promise<void>((p) => setTimeout(p, 1000));
        svc = {
            id: 0,
            address: 'f8d6e0586b0a20c7',
            private_key: Buffer.from('ec8cd232a763fb481711a0f9ce7d1241c7bc3865689afb31e6b213d781642ea7', 'hex'),
            public_key: Buffer.from('81c12390330fdbb55340911b812b50ce7795eefe5478bc5659429f41bdf83d8b6b50f9acc730b9cae67dc29e594ade93cac33f085f07275b8d45331a754497dd', 'hex'),
            hash_algo: 3,
            sign_algo: 2,
            weight: 1000,
        };
        // connect to emulator
        flow = new Flow(FlowNetwork.EMULATOR, '0xf8d6e0586b0a20c7', [svc], 5);
        await flow.start();
        // create usr1 and usr2 accounts for testing
        usr1 = {
            private_key: Buffer.from('ac4fdb02a932bc4a0cae0987258316727ede1973f784b91260f5bfeccfebb900', 'hex'),
            public_key: Buffer.from('54cfa0f49e1364255eb5ac6b3b5a6fd5a23cf9a786c39640a5a0ccd9d257c85d1de75d0f928ad504af4a9791e9d1b9ed4faae0149b0ffb75094cbea4c23fc1f1', 'hex'),
            hash_algo: 3,
            sign_algo: 2,
            weight: 1000,
        };
        const acct1 = await flow.create_account([usr1]);
        if (acct1 instanceof Error) return Promise.reject(acct1);
        usr1.address = acct1.events.filter((x) => x.type == 'flow.AccountCreated')[0].payload.value.fields[0].value.value.replace(/\b0x/g, '');
        usr2 = {
            private_key: Buffer.from('ac4fdb02a932bc4a0cae0987258316727ede1973f784b91260f5bfeccfebb900', 'hex'),
            public_key: Buffer.from('54cfa0f49e1364255eb5ac6b3b5a6fd5a23cf9a786c39640a5a0ccd9d257c85d1de75d0f928ad504af4a9791e9d1b9ed4faae0149b0ffb75094cbea4c23fc1f1', 'hex'),
            hash_algo: 3,
            sign_algo: 2,
            weight: 1000,
        };
        const acct2 = await flow.create_account([usr1]);
        if (acct2 instanceof Error) return Promise.reject(acct2);
        usr2.address = acct2.events.filter((x) => x.type == 'flow.AccountCreated')[0].payload.value.fields[0].value.value.replace(/\b0x/g, '');
    });

    afterAll(async () => {
        // stop Flow
        flow.stop();
        emulator.kill();
    });

    it('C_R3VNFTS should deploy', async () => {
        expect(flow).toBeInstanceOf(Flow);
        const contract: string = fs.readFileSync('cadence/C_R3VNFTS.cdc').toString('utf-8');
        const txRes = await flow.add_contract('R3VNFTS', contract, svc);
        expect(txRes).not.toBeInstanceOf(Error);
        expect((txRes as TransactionResultResponse).events.filter(x => x.type == 'flow.AccountContractAdded').length).toBe(1);
    });

    it('T_MINT_NFTS should work', async () => {
        expect(flow).toBeInstanceOf(Flow);
        const transaction: string = fs.readFileSync('cadence/T_MINT_NFTS.cdc').toString('utf-8')
            // service account
            .replace(/[$](service)/g, svc.address);

        const metadataForNFT1 = {
            ID: 1,                                                      // this is our R3V ID, not the NFT id
            DROP: 1,                                                    // this is the R3V Drop ID
            ARTISTS: "Various Artists",                                 // artist names (Multiple = 5+, Various = 20+)
            VENUE: "LOCAL VENUE",                                       // venue name
            EVENT: "LOCAL EVENT",                                       // the event
            DATE: "1638921600",                                         // epoch timestamp, no milliseconds
            IPFS: "QmUSxtU3h27vfbnSELhK2xTkb3PvxD9XVVJjfRnJ5HFJ45",     // the IPFS hash for the video file (always .mp4)
        }

        const metadataForNFT2 = {
            ID: 2,                                                      // this is our R3V ID, not the NFT id
            DROP: 1,                                                    // this is the R3V Drop ID
            ARTISTS: "Various Artists",                                 // artist names (Multiple = 5+, Various = 20+)
            VENUE: "LOCAL VENUE",                                       // venue name
            EVENT: "LOCAL EVENT",                                       // the event
            DATE: "1638921600",                                         // epoch timestamp, no milliseconds
            IPFS: "QmUSxtU3h27vfbnSELhK2xTkb3PvxD9XVVJjfRnJ5HFJ45",     // the IPFS hash for the video file (always .mp4)
        }

        // stringify objects into JSON before gzip
        const metadata1 = await new Promise<Buffer>((p) => gzip(Buffer.from(JSON.stringify(metadataForNFT1)), (e, b) => p(b)));
        const metadata2 = await new Promise<Buffer>((p) => gzip(Buffer.from(JSON.stringify(metadataForNFT2)), (e, b) => p(b)));

        const txRes = await flow.execute_transaction(transaction, [[metadata1.toString('hex'), metadata2.toString('hex')]]);
        if (txRes instanceof Error) return Promise.reject(txRes);
        if (txRes.status_code != 0) return Promise.reject(Error(txRes.error_message));
        if (txRes.events.length != 4) return Promise.reject(Error('invalid number of events, expected 4:' + JSON.stringify(txRes.events, null, 2)))
    });

    it('T_SETUP should work', async () => {
        expect(flow).toBeInstanceOf(Flow);
        const transaction: string = fs.readFileSync('cadence/T_SETUP.cdc').toString('utf-8')
            // service account
            .replace(/[$](service)/g, svc.address);
        const txRes = await flow.execute_transaction(transaction, [], [usr1]);
        if (txRes instanceof Error) return Promise.reject(txRes);
        if (txRes.status_code != 0) return Promise.reject(Error(txRes.error_message));
        const txRes2 = await flow.execute_transaction(transaction, [], [usr2]);
        if (txRes2 instanceof Error) return Promise.reject(txRes2);
        if (txRes2.status_code != 0) return Promise.reject(Error(txRes2.error_message));
    });

    it('T_TRANSFER_NFT should work', async () => {
        expect(flow).toBeInstanceOf(Flow);
        const transaction: string = fs.readFileSync('cadence/T_TRANSFER_NFT.cdc').toString('utf-8')
            // service account
            .replace(/[$](service)/g, svc.address)
            // buyer account
            .replace(/[$](buyer)/g, usr1.address);
        // transfer NFT id 1 to usr1
        const txRes = await flow.execute_transaction(transaction, [1]);
        if (txRes instanceof Error) return Promise.reject(txRes);
        if (txRes.status_code != 0) return Promise.reject(Error(txRes.error_message));
        // expect((txRes as TransactionResultResponse).events.filter(x => x.type == 'flow.AccountContractAdded').length).toBe(1);
    });

    it('S_GET_IDS should work', async () => {
        expect(flow).toBeInstanceOf(Flow);
        const script: string = fs.readFileSync('cadence/S_GET_IDS.cdc').toString('utf-8')
            // service account
            .replace(/[$](service)/g, svc.address)
            // account to check
            .replace(/[$](account)/g, usr1.address);
        const scRes = await flow.execute_script(script, []);
        if (scRes instanceof Error) return Promise.reject(scRes);
        expect(scRes.value[0].value).toBe('1');
        // expect nft id 1
    });

    it('S_GET_NFTS should work', async () => {
        expect(flow).toBeInstanceOf(Flow);
        const script: string = fs.readFileSync('cadence/S_GET_NFTS.cdc').toString('utf-8')
            // service account
            .replace(/[$](service)/g, svc.address)
            // account to check
            .replace(/[$](account)/g, usr1.address);
        const scRes = await flow.execute_script(script, [[1]]);
        if (scRes instanceof Error) return Promise.reject(scRes);
        const decodedNFT = await new Promise<any>((p) => gunzip(Buffer.from(scRes.value[0].value, 'hex'), (e, b) => p(JSON.parse(b.toString('utf-8')))));
        expect(decodedNFT.ID).toBe(1);
    });
});