import 'jest';
import { Flow, FlowKey, FlowNetwork, Proposal, TransactionResultResponse } from '../../flow-ts';
import * as fs from 'fs';
import { exec, ChildProcess } from 'child_process';
import { gzip } from 'zlib';

describe('ContractTesting', () => {
    let flow: Flow;
    let svc: Proposal;
    let usr1: Proposal;
    let usr2: Proposal;
    let emulator: ChildProcess;

    beforeAll(async () => {
        // start emulator
        emulator = exec('flow emulator -f flow.json');
        // wait 1 second
        await new Promise<void>((p) => setTimeout(p, 1000));
        const key0: FlowKey = {
            keyID: 0,
            private: 'ec8cd232a763fb481711a0f9ce7d1241c7bc3865689afb31e6b213d781642ea7',
            public: '81c12390330fdbb55340911b812b50ce7795eefe5478bc5659429f41bdf83d8b6b50f9acc730b9cae67dc29e594ade93cac33f085f07275b8d45331a754497dd',
        };
        svc = {
            address: Buffer.from('f8d6e0586b0a20c7', 'hex'),
            privateKey: 'ec8cd232a763fb481711a0f9ce7d1241c7bc3865689afb31e6b213d781642ea7',
            publicKey: '81c12390330fdbb55340911b812b50ce7795eefe5478bc5659429f41bdf83d8b6b50f9acc730b9cae67dc29e594ade93cac33f085f07275b8d45331a754497dd',
        }
        // connect to emulator
        flow = new Flow(FlowNetwork.EMULATOR, '0xf8d6e0586b0a20c7', [key0], 5);
        await flow.start();
        // create usr1 and usr2 accounts for testing
        let acct1 = await flow.create_account(['54cfa0f49e1364255eb5ac6b3b5a6fd5a23cf9a786c39640a5a0ccd9d257c85d1de75d0f928ad504af4a9791e9d1b9ed4faae0149b0ffb75094cbea4c23fc1f1']);
        if (acct1 instanceof Error) return Promise.reject(acct1);
        usr1 = {
            address: Buffer.from(acct1.events.filter((x) => x.type == 'flow.AccountCreated')[0].payload.value.fields[0].value.value.replace(/\b0x/g, ''), 'hex'),
            privateKey: 'ac4fdb02a932bc4a0cae0987258316727ede1973f784b91260f5bfeccfebb900',
            publicKey: '54cfa0f49e1364255eb5ac6b3b5a6fd5a23cf9a786c39640a5a0ccd9d257c85d1de75d0f928ad504af4a9791e9d1b9ed4faae0149b0ffb75094cbea4c23fc1f1'
        }
        let acct2 = await flow.create_account(['fd8e43b88a5042e9dce0c5d0d0014455ec5dd512efed92a104381e21592baf23c171a82a7b5c2714d4e05af12a2c95ba052ab1b54c265451f3ae8b0cec370c2b'])
        if (acct2 instanceof Error) return Promise.reject(acct2);
        usr2 = {
            address: Buffer.from(acct2.events.filter((x) => x.type == 'flow.AccountCreated')[0].payload.value.fields[0].value.value.replace(/\b0x/g, ''), 'hex'),
            privateKey: '09aa0e3bff02c0a2e9d0e495b5628c0f295976e11af2900d83d87426f1a3839b',
            publicKey: 'fd8e43b88a5042e9dce0c5d0d0014455ec5dd512efed92a104381e21592baf23c171a82a7b5c2714d4e05af12a2c95ba052ab1b54c265451f3ae8b0cec370c2b'
        }
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
            .replace(/[$](service)/g, svc.address.toString('hex'));

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
            .replace(/[$](service)/g, svc.address.toString('hex'));
        const txRes = await flow.execute_transaction(transaction, [], [usr1], usr1);
        if (txRes instanceof Error) return Promise.reject(txRes);
        if (txRes.status_code != 0) return Promise.reject(Error(txRes.error_message));
        const txRes2 = await flow.execute_transaction(transaction, [], [usr2], usr2);
        if (txRes2 instanceof Error) return Promise.reject(txRes2);
        if (txRes2.status_code != 0) return Promise.reject(Error(txRes2.error_message));
    });

    it('T_TRANSFER_NFT should work', async () => {
        expect(flow).toBeInstanceOf(Flow);
        const transaction: string = fs.readFileSync('cadence/T_TRANSFER_NFT.cdc').toString('utf-8')
            // service account
            .replace(/[$](service)/g, svc.address.toString('hex'))
            // buyer account
            .replace(/[$](buyer)/g, usr1.address.toString('hex'));
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
            .replace(/[$](service)/g, svc.address.toString('hex'))
            // account to check
            .replace(/[$](account)/g, usr1.address.toString('hex'));
        const scRes = await flow.execute_script(script, []);
        if (scRes instanceof Error) return Promise.reject(scRes);
        expect(scRes.value[0].value).toBe('1');
        // expect nft id 1
    });

    it('S_GET_NFTS should work', async () => {
        expect(flow).toBeInstanceOf(Flow);
        const script: string = fs.readFileSync('cadence/S_GET_NFTS.cdc').toString('utf-8')
            // service account
            .replace(/[$](service)/g, svc.address.toString('hex'))
            // account to check
            .replace(/[$](account)/g, usr1.address.toString('hex'));
        const scRes = await flow.execute_script(script, [[1]]);
        if (scRes instanceof Error) return Promise.reject(scRes);
        expect(scRes.value[0].value).toBe('1f8b080000000000001355ccb10e82301804e05721ffcc40a9a0b0155b22d0686d4be32a03018d98009226c677b7b8b95dbebbdc1b0a0a29f281ca93f8052275a1b48214cc75ec9fafc923e3dc4ff3043e1876ac996b324ef695974ba61d32a7fa0fbd8c70ee1a4af4ba4631de25218a83c05921f2f5fbfca8959d6bdc85dba56d06c578578556df1b2c164b938b31e5ad9543191df27213c1e70bb03a396ca8000000');
    });
});