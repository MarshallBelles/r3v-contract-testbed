import 'jest';
import { Flow, FlowKey, FlowNetwork, Proposal, TransactionResultResponse } from '../../flow-ts';
import * as fs from 'fs';

describe('ContractTesting', () => {
    let flow: Flow;
    let svc: Proposal;

    beforeAll(async () => {
        // start Flow
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
        flow = new Flow(FlowNetwork.EMULATOR, '0xf8d6e0586b0a20c7', [key0], 5);
        await flow.start();
    })

    afterAll(() => {
        // stop Flow
        flow.stop();
    })

    it('should deploy the contract', async () => {
        expect(flow).toBeInstanceOf(Flow);
        const contract: string = fs.readFileSync('cadence/C_R3VNFTS.cdc').toString('utf-8');
        const txRes = await flow.add_contract('R3VNFTS', contract, svc);
        expect(txRes).not.toBeInstanceOf(Error);
        expect((txRes as TransactionResultResponse).events.filter(x => x.type == 'flow.AccountContractAdded').length).toBe(1);
    });
});