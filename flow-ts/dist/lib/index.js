"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __values = (this && this.__values) || function(o) {
    var s = typeof Symbol === "function" && Symbol.iterator, m = s && o[s], i = 0;
    if (m) return m.call(o);
    if (o && typeof o.length === "number") return {
        next: function () {
            if (o && i >= o.length) o = void 0;
            return { value: o && o[i++], done: !o };
        }
    };
    throw new TypeError(s ? "Object is not iterable." : "Symbol.iterator is not defined.");
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Flow = exports.FlowNetwork = exports.TransactionStatus = exports.toBuffer = exports.getLength = exports.decode = exports.encode = void 0;
var debug_1 = require("debug");
var grpc = require("@grpc/grpc-js");
var protoLoader = require("@grpc/proto-loader");
var buffer_1 = require("buffer");
var elliptic_1 = require("elliptic");
var sha3_1 = require("sha3");
var encode = function (input) {
    if (Array.isArray(input)) {
        var output = [];
        for (var i = 0; i < input.length; i++) {
            output.push((0, exports.encode)(input[i]));
        }
        var buf = buffer_1.Buffer.concat(output);
        return buffer_1.Buffer.concat([encodeLength(buf.length, 192), buf]);
    }
    else {
        var inputBuf = (0, exports.toBuffer)(input);
        return inputBuf.length === 1 && inputBuf[0] < 128 ?
            inputBuf :
            buffer_1.Buffer.concat([encodeLength(inputBuf.length, 128), inputBuf]);
    }
};
exports.encode = encode;
var safeParseInt = function (v, base) {
    if (v.slice(0, 2) === '00') {
        throw new Error('invalid RLP: extra zeros');
    }
    return parseInt(v, base);
};
var encodeLength = function (len, offset) {
    if (len < 56) {
        return buffer_1.Buffer.from([len + offset]);
    }
    else {
        var hexLength = intToHex(len);
        var lLength = hexLength.length / 2;
        var firstByte = intToHex(offset + 55 + lLength);
        return buffer_1.Buffer.from(firstByte + hexLength, 'hex');
    }
};
var decode = function (input, stream) {
    if (stream === void 0) {
        stream = false;
    }
    if (!input || input.length === 0) {
        return buffer_1.Buffer.from([]);
    }
    var inputBuffer = (0, exports.toBuffer)(input);
    var decoded = _decode(inputBuffer);
    if (stream) {
        return decoded;
    }
    if (decoded.remainder.length !== 0) {
        throw new Error('invalid remainder');
    }
    return decoded.data;
};
exports.decode = decode;
var getLength = function (input) {
    if (!input || input.length === 0) {
        return buffer_1.Buffer.from([]);
    }
    var inputBuffer = (0, exports.toBuffer)(input);
    var firstByte = inputBuffer[0];
    if (firstByte <= 0x7f) {
        return inputBuffer.length;
    }
    else if (firstByte <= 0xb7) {
        return firstByte - 0x7f;
    }
    else if (firstByte <= 0xbf) {
        return firstByte - 0xb6;
    }
    else if (firstByte <= 0xf7) {
        return firstByte - 0xbf;
    }
    else {
        var llength = firstByte - 0xf6;
        var length = safeParseInt(inputBuffer.slice(1, llength).toString('hex'), 16);
        return llength + length;
    }
};
exports.getLength = getLength;
var _decode = function (input) {
    var length;
    var llength;
    var data;
    var innerRemainder;
    var d;
    var decoded = [];
    var firstByte = input[0];
    if (firstByte <= 0x7f) {
        return {
            data: input.slice(0, 1),
            remainder: input.slice(1),
        };
    }
    else if (firstByte <= 0xb7) {
        length = firstByte - 0x7f;
        if (firstByte === 0x80) {
            data = buffer_1.Buffer.from([]);
        }
        else {
            data = input.slice(1, length);
        }
        if (length === 2 && data[0] < 0x80) {
            throw new Error('invalid rlp encoding: byte must be less 0x80');
        }
        return {
            data: data,
            remainder: input.slice(length),
        };
    }
    else if (firstByte <= 0xbf) {
        llength = firstByte - 0xb6;
        length = safeParseInt(input.slice(1, llength).toString('hex'), 16);
        data = input.slice(llength, length + llength);
        if (data.length < length) {
            throw new Error('invalid RLP');
        }
        return {
            data: data,
            remainder: input.slice(length + llength),
        };
    }
    else if (firstByte <= 0xf7) {
        length = firstByte - 0xbf;
        innerRemainder = input.slice(1, length);
        while (innerRemainder.length) {
            d = _decode(innerRemainder);
            decoded.push(d.data);
            innerRemainder = d.remainder;
        }
        return {
            data: decoded,
            remainder: input.slice(length),
        };
    }
    else {
        llength = firstByte - 0xf6;
        length = safeParseInt(input.slice(1, llength).toString('hex'), 16);
        var totalLength = llength + length;
        if (totalLength > input.length) {
            throw new Error('invalid rlp: total length is larger than the data');
        }
        innerRemainder = input.slice(llength, totalLength);
        if (innerRemainder.length === 0) {
            throw new Error('invalid rlp, List has a invalid length');
        }
        while (innerRemainder.length) {
            d = _decode(innerRemainder);
            decoded.push(d.data);
            innerRemainder = d.remainder;
        }
        return {
            data: decoded,
            remainder: input.slice(totalLength),
        };
    }
};
var isHexPrefixed = function (str) {
    return str.slice(0, 2) === '0x';
};
var stripHexPrefix = function (str) {
    if (typeof str !== 'string') {
        return str;
    }
    return isHexPrefixed(str) ? str.slice(2) : str;
};
var intToHex = function (integer) {
    if (integer < 0) {
        throw new Error('Invalid integer as argument, must be unsigned!');
    }
    var hex = integer.toString(16);
    return hex.length % 2 ? '0' + hex : hex;
};
var padToEven = function (a) {
    return a.length % 2 ? '0' + a : a;
};
var intToBuffer = function (integer) {
    var hex = intToHex(integer);
    return buffer_1.Buffer.from(hex, 'hex');
};
var toBuffer = function (v) {
    if (!buffer_1.Buffer.isBuffer(v)) {
        if (typeof v === 'string') {
            if (isHexPrefixed(v)) {
                return buffer_1.Buffer.from(padToEven(stripHexPrefix(v)), 'hex');
            }
            else {
                return buffer_1.Buffer.from(v);
            }
        }
        else if (typeof v === 'number') {
            if (!v) {
                return buffer_1.Buffer.from([]);
            }
            else {
                return intToBuffer(v);
            }
        }
        else if (v === null || v === undefined) {
            return buffer_1.Buffer.from([]);
        }
        else if (v instanceof Uint8Array) {
            return buffer_1.Buffer.from(v);
        }
        else {
            throw new Error('invalid type');
        }
    }
    return v;
};
exports.toBuffer = toBuffer;
var debugLog = (0, debug_1.default)("functions");
var TransactionStatus;
(function (TransactionStatus) {
    // eslint-disable-next-line no-unused-vars
    TransactionStatus[TransactionStatus["UNKNOWN"] = 0] = "UNKNOWN";
    // eslint-disable-next-line no-unused-vars
    TransactionStatus[TransactionStatus["PENDING"] = 1] = "PENDING";
    // eslint-disable-next-line no-unused-vars
    TransactionStatus[TransactionStatus["FINALIZED"] = 2] = "FINALIZED";
    // eslint-disable-next-line no-unused-vars
    TransactionStatus[TransactionStatus["EXECUTED"] = 3] = "EXECUTED";
    // eslint-disable-next-line no-unused-vars
    TransactionStatus[TransactionStatus["SEALED"] = 4] = "SEALED";
    // eslint-disable-next-line no-unused-vars
    TransactionStatus[TransactionStatus["EXPIRED"] = 5] = "EXPIRED";
})(TransactionStatus = exports.TransactionStatus || (exports.TransactionStatus = {}));
var encodeTransactionPayload = function (tx) { return rlpEncode(preparePayload(tx)); };
var encodeTransactionEnvelope = function (tx) { return rlpEncode(prepareEnvelope(tx)); };
var rightPaddedHexBuffer = function (value, pad) { return buffer_1.Buffer.from(value.padEnd(pad * 2, '0'), 'hex'); };
var leftPaddedHexBuffer = function (value, pad) { return buffer_1.Buffer.from(value.padStart(pad * 2, '0'), 'hex'); };
var addressBuffer = function (addr) { return leftPaddedHexBuffer(addr, 8); };
var blockBuffer = function (block) { return leftPaddedHexBuffer(block, 32); };
var scriptBuffer = function (script) { return buffer_1.Buffer.from(script, 'utf8'); };
var signatureBuffer = function (signature) { return buffer_1.Buffer.from(signature, 'hex'); };
// not ready for prime time just yet
/* export const keygen = (): Keys => {
  const ec = new EC('p256');
  const kp = ec.genKeyPair();
  return {
    private: kp.getPrivate().toString('hex'),
    public: kp.getPublic().encode('hex', false),
  };
}; */
var rlpEncode = function (v) {
    return (0, exports.encode)(v).toString('hex');
};
var argParse = function (arg) {
    switch (typeof arg) {
        case 'string':
            // handle string
            return {
                type: 'String',
                value: arg,
            };
        case 'boolean':
            // handle boolean
            return {
                type: 'Bool',
                value: arg,
            };
        case 'bigint':
            // handle bigint
            return {
                type: 'Int64',
                value: arg.toString(),
            };
        case 'number':
            // handle number
            if (Number.isInteger(arg)) {
                return {
                    type: 'Int',
                    value: arg.toString(),
                };
            }
            else {
                return {
                    type: 'Fix64',
                    value: arg.toString(),
                };
            }
        default:
            // argument is not supported, convert to string
            return {
                type: 'String',
                value: arg.toString(),
            };
    }
};
var argBuilder = function (args) {
    var bufs = [];
    args.forEach(function (a) {
        // handle map<any, any>
        if (a instanceof Map) {
            var mapEntries_1 = [];
            a.forEach(function (v, k) {
                mapEntries_1.push({
                    key: argParse(k),
                    value: argParse(v),
                });
            });
            bufs.push(buffer_1.Buffer.from(JSON.stringify({
                type: 'Dictionary',
                value: mapEntries_1,
            }), 'utf-8'));
            // assume its string : string
        }
        else if (Array.isArray(a)) {
            var arrEntries_1 = [];
            a.forEach(function (e) {
                arrEntries_1.push(argParse(e));
            });
            bufs.push(buffer_1.Buffer.from(JSON.stringify({
                type: 'Array',
                value: arrEntries_1,
            }), 'utf-8'));
            // handle array
        }
        else {
            bufs.push(buffer_1.Buffer.from(JSON.stringify(argParse(a))));
        }
    });
    return bufs;
};
var preparePayload = function (tx) {
    return [
        scriptBuffer(tx.script),
        tx.arguments,
        blockBuffer(tx.refBlock),
        tx.gasLimit,
        addressBuffer(tx.proposalKey.address.toString('hex')),
        tx.proposalKey.key_id,
        tx.proposalKey.sequence_number,
        addressBuffer(tx.payer),
        tx.authorizers.map(addressBuffer),
    ];
};
var prepareEnvelope = function (tx) {
    return [preparePayload(tx), preparePayloadSignatures(tx)];
};
var preparePayloadSignatures = function (tx) {
    var sigs = [];
    tx.authorizers.forEach(function (auth, i) {
        tx.payload_signatures.forEach(function (sig) {
            if (sig.address == auth) {
                sigs.push([
                    i,
                    sig.keyId,
                    signatureBuffer(sig.sig),
                ]);
            }
        });
    });
    return sigs;
};
var TX_DOMAIN_TAG_HEX = rightPaddedHexBuffer(buffer_1.Buffer.from('FLOW-V0.0-transaction').toString('hex'), 32).toString('hex');
var transactionSignature = function (msg, privateKey) {
    debugLog('transactionSignature:', msg, '::', privateKey);
    var ec = new elliptic_1.ec('p256');
    var key = ec.keyFromPrivate(buffer_1.Buffer.from(privateKey, 'hex'));
    var sha = new sha3_1.SHA3(256);
    var totalMsgHex = TX_DOMAIN_TAG_HEX + msg;
    sha.update(buffer_1.Buffer.from(totalMsgHex, 'hex'));
    var digest = sha.digest();
    var sig = key.sign(digest);
    var n = 32;
    var r = sig.r.toArrayLike(buffer_1.Buffer, 'be', n);
    var s = sig.s.toArrayLike(buffer_1.Buffer, 'be', n);
    return buffer_1.Buffer.concat([r, s]).toString('hex');
};
// eslint-disable-next-line no-unused-vars
var FlowNetwork;
(function (FlowNetwork) {
    // eslint-disable-next-line no-unused-vars
    FlowNetwork[FlowNetwork["EMULATOR"] = 0] = "EMULATOR";
    // eslint-disable-next-line no-unused-vars
    FlowNetwork[FlowNetwork["TESTNET"] = 1] = "TESTNET";
    // eslint-disable-next-line no-unused-vars
    FlowNetwork[FlowNetwork["MAINNET"] = 2] = "MAINNET";
})(FlowNetwork = exports.FlowNetwork || (exports.FlowNetwork = {}));
// eslint-disable-next-line no-unused-vars
var FlowWorkType;
(function (FlowWorkType) {
    // eslint-disable-next-line no-unused-vars
    FlowWorkType[FlowWorkType["SCRIPT"] = 0] = "SCRIPT";
    // eslint-disable-next-line no-unused-vars
    FlowWorkType[FlowWorkType["TRANSACTION"] = 1] = "TRANSACTION";
    // eslint-disable-next-line no-unused-vars
    FlowWorkType[FlowWorkType["GetLatestBlockHeader"] = 2] = "GetLatestBlockHeader";
    // eslint-disable-next-line no-unused-vars
    FlowWorkType[FlowWorkType["GetBlockHeaderByID"] = 3] = "GetBlockHeaderByID";
    // eslint-disable-next-line no-unused-vars
    FlowWorkType[FlowWorkType["GetBlockHeaderByHeight"] = 4] = "GetBlockHeaderByHeight";
    // eslint-disable-next-line no-unused-vars
    FlowWorkType[FlowWorkType["GetLatestBlock"] = 5] = "GetLatestBlock";
    // eslint-disable-next-line no-unused-vars
    FlowWorkType[FlowWorkType["GetBlockByID"] = 6] = "GetBlockByID";
    // eslint-disable-next-line no-unused-vars
    FlowWorkType[FlowWorkType["GetBlockByHeight"] = 7] = "GetBlockByHeight";
    // eslint-disable-next-line no-unused-vars
    FlowWorkType[FlowWorkType["GetCollectionByID"] = 8] = "GetCollectionByID";
    // eslint-disable-next-line no-unused-vars
    FlowWorkType[FlowWorkType["GetTransaction"] = 9] = "GetTransaction";
    // eslint-disable-next-line no-unused-vars
    FlowWorkType[FlowWorkType["GetTransactionResult"] = 10] = "GetTransactionResult";
    // eslint-disable-next-line no-unused-vars
    FlowWorkType[FlowWorkType["GetAccountAtLatestBlock"] = 11] = "GetAccountAtLatestBlock";
    // eslint-disable-next-line no-unused-vars
    FlowWorkType[FlowWorkType["GetAccountAtBlockHeight"] = 12] = "GetAccountAtBlockHeight";
    // eslint-disable-next-line no-unused-vars
    FlowWorkType[FlowWorkType["GetEventsForHeightRange"] = 13] = "GetEventsForHeightRange";
})(FlowWorkType || (FlowWorkType = {}));
// eslint-disable-next-line no-unused-vars
var FlowWorkerStatus;
(function (FlowWorkerStatus) {
    // eslint-disable-next-line no-unused-vars
    FlowWorkerStatus[FlowWorkerStatus["CONNECTING"] = 0] = "CONNECTING";
    // eslint-disable-next-line no-unused-vars
    FlowWorkerStatus[FlowWorkerStatus["IDLE"] = 1] = "IDLE";
    // eslint-disable-next-line no-unused-vars
    FlowWorkerStatus[FlowWorkerStatus["PROCESSING"] = 2] = "PROCESSING";
})(FlowWorkerStatus || (FlowWorkerStatus = {}));
var processEvents = function (txr) {
    txr.events.forEach(function (evt, i) {
        var pld = JSON.parse(evt.payload.toString('utf-8'));
        txr.events[i].payload = pld;
    });
};
var encodePublicKeyForFlow = function (a) { return (0, exports.encode)([
    buffer_1.Buffer.from(a.public, 'hex'),
    2,
    3,
    a.weight > 0 ? a.weight : 1, // cannot be null or negative
]).toString('hex'); };
var signTransaction = function (transaction, payloadSignatures, envelopeSignatures) {
    var tr = transaction;
    var payloadSigs = [];
    payloadSignatures.forEach(function (ps) {
        debugLog('signTransaction:', ps.address, '::', ps.private_key, '::', ps.key_id);
        var payloadMsg = encodeTransactionPayload({
            script: tr.script.toString('utf-8'),
            arguments: tr.arguments,
            refBlock: tr.reference_block_id.toString('hex'),
            gasLimit: tr.gas_limit,
            proposalKey: {
                address: tr.proposal_key.address,
                key_id: tr.proposal_key.key_id,
                sequence_number: tr.proposal_key.sequence_number,
            },
            payer: tr.payer.toString('hex'),
            authorizers: tr.authorizers.map(function (x) { return x.toString('hex'); }),
        });
        var thisSig = transactionSignature(payloadMsg, ps.private_key);
        tr.payload_signatures.push({ address: buffer_1.Buffer.from(ps.address, 'hex'), key_id: ps.key_id, signature: buffer_1.Buffer.from(thisSig, 'hex') });
        payloadSigs.push({ address: ps.address, keyId: ps.key_id, sig: thisSig });
    });
    debugLog(payloadSigs);
    envelopeSignatures.forEach(function (es) {
        debugLog('signTransaction:', tr);
        debugLog('signTransaction:', es.address, '::', es.private_key, '::', es.key_id);
        var envelopeMsg = encodeTransactionEnvelope({
            script: tr.script.toString('utf-8'),
            arguments: tr.arguments,
            refBlock: tr.reference_block_id.toString('hex'),
            gasLimit: tr.gas_limit,
            proposalKey: {
                address: tr.proposal_key.address,
                key_id: tr.proposal_key.key_id,
                sequence_number: tr.proposal_key.sequence_number,
            },
            payer: tr.payer.toString('hex'),
            payload_signatures: payloadSigs,
            authorizers: tr.authorizers.map(function (x) { return x.toString('hex'); }),
        });
        var thisSig = transactionSignature(envelopeMsg, es.private_key);
        tr.envelope_signatures.push({ address: buffer_1.Buffer.from(es.address, 'hex'), key_id: es.key_id, signature: buffer_1.Buffer.from(thisSig, 'hex') });
    });
    return tr;
};
var Flow = /** @class */ (function () {
    function Flow(network, serviceAccountAddress, privateKeys, tick) {
        this.privateKeys = [];
        this.workers = [];
        this.work = [];
        this.shutdown = false;
        this.tickTimeout = 20;
        this.processing = false;
        tick ? this.tickTimeout = tick : 20;
        this.dbg = (0, debug_1.default)('Flow');
        switch (network) {
            case FlowNetwork.EMULATOR:
                this.network = '127.0.0.1:3569';
                break;
            case FlowNetwork.TESTNET:
                this.network = 'access.devnet.nodes.onflow.org:9000';
                break;
            case FlowNetwork.MAINNET:
                this.network = 'access.mainnet.nodes.onflow.org:9000';
                break;
            default:
                this.network = network;
                break;
        }
        this.serviceAccountAddress = serviceAccountAddress.replace(/\b0x/g, '');
        this.privateKeys = privateKeys;
    }
    Flow.prototype.start = function () {
        return __awaiter(this, void 0, void 0, function () {
            var processingConnections;
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        this.dbg('Starting Flow-ts');
                        this.dbg('Access Node:', this.network);
                        this.dbg('Private Keys:', this.privateKeys.length);
                        processingConnections = [];
                        this.privateKeys.forEach(function (k) {
                            processingConnections.push(new Promise(function (p) { return __awaiter(_this, void 0, void 0, function () {
                                var worker;
                                return __generator(this, function (_a) {
                                    switch (_a.label) {
                                        case 0:
                                            worker = new FlowWorker(k.private, k.public, k.keyID, this.network);
                                            return [4 /*yield*/, worker.connect()];
                                        case 1:
                                            _a.sent();
                                            this.workers.push(worker);
                                            p(true);
                                            return [2 /*return*/];
                                    }
                                });
                            }); }));
                        });
                        return [4 /*yield*/, Promise.all(processingConnections)];
                    case 1:
                        _a.sent();
                        this.dbg('Workers:', this.workers.length);
                        this.dbg('Flow.ts Ready');
                        this.tick();
                        return [2 /*return*/];
                }
            });
        });
    };
    Flow.prototype.tick = function () {
        return __awaiter(this, void 0, void 0, function () {
            var beginningCount;
            var _this = this;
            return __generator(this, function (_a) {
                if (!this.processing) {
                    this.processing = true;
                    beginningCount = this.work.length;
                    if (beginningCount > 0) {
                        this.workers.forEach(function (w) {
                            if (_this.work.length > 0 && w.status == FlowWorkerStatus.IDLE) {
                                w.process(_this.work.splice(0, 1)[0]);
                            }
                        });
                        if (this.shutdown)
                            this.dbg('Cleaning up for shutdown');
                    }
                    if (this.error)
                        console.log('Error:', this.error);
                    this.processing = false;
                }
                if (!this.shutdown || this.work.length > 0)
                    setTimeout(function () { return _this.tick(); }, this.tickTimeout);
                return [2 /*return*/];
            });
        });
    };
    Flow.prototype.stop = function () {
        this.shutdown = true;
    };
    Flow.prototype.get_account = function (accountAddress, blockHeight) {
        return __awaiter(this, void 0, void 0, function () {
            var _this = this;
            return __generator(this, function (_a) {
                return [2 /*return*/, new Promise(function (p) {
                        var cb = function (err, res) {
                            if (err)
                                p(err);
                            p(res['account']);
                        };
                        if (typeof blockHeight == 'number') {
                            _this.work.push({
                                type: FlowWorkType.GetAccountAtBlockHeight,
                                arguments: [accountAddress, blockHeight],
                                callback: cb,
                            });
                        }
                        else {
                            _this.work.push({
                                type: FlowWorkType.GetAccountAtLatestBlock,
                                arguments: [accountAddress],
                                callback: cb,
                            });
                        }
                    })];
            });
        });
    };
    Flow.prototype.execute_script = function (script, arg) {
        return __awaiter(this, void 0, void 0, function () {
            var _this = this;
            return __generator(this, function (_a) {
                return [2 /*return*/, new Promise(function (p) {
                        var cb = function (err, res) {
                            if (err)
                                p(err);
                            p(JSON.parse(buffer_1.Buffer.from(res.value).toString('utf8')));
                        };
                        _this.work.push({
                            type: FlowWorkType.SCRIPT,
                            script: buffer_1.Buffer.from(script, 'utf-8'),
                            arguments: arg,
                            callback: cb,
                        });
                    })];
            });
        });
    };
    Flow.prototype.execute_transaction = function (script, arg, authorizers, proposer, payer) {
        return __awaiter(this, void 0, void 0, function () {
            var _this = this;
            return __generator(this, function (_a) {
                return [2 /*return*/, new Promise(function (p) {
                        if (!payer)
                            payer = { address: buffer_1.Buffer.from(_this.serviceAccountAddress, 'hex'), privateKey: '', publicKey: '' };
                        var cb = function (err, res) {
                            if (err)
                                p(err);
                            p(res);
                        };
                        if (!proposer)
                            proposer = payer;
                        if (!authorizers)
                            authorizers = [proposer];
                        if (authorizers.length == 0)
                            authorizers = [proposer];
                        var payloadSigs = [];
                        var envelopeSigs = [];
                        authorizers.forEach(function (a) {
                            if (a.address != (payer === null || payer === void 0 ? void 0 : payer.address)) {
                                payloadSigs.push(a);
                            }
                        });
                        if (proposer && proposer.address != (payer === null || payer === void 0 ? void 0 : payer.address))
                            payloadSigs.push(proposer);
                        envelopeSigs.push(payer);
                        _this.work.push({
                            type: FlowWorkType.TRANSACTION,
                            script: buffer_1.Buffer.from(script, 'utf-8'),
                            arguments: arg,
                            proposer: proposer,
                            payer: payer.address,
                            authorizers: authorizers,
                            payload_signatures: payloadSigs,
                            envelope_signatures: envelopeSigs,
                            callback: cb,
                        });
                    })];
            });
        });
    };
    Flow.prototype.create_account = function (newAccountKeys) {
        return __awaiter(this, void 0, void 0, function () {
            var _this = this;
            return __generator(this, function (_a) {
                return [2 /*return*/, new Promise(function (p) {
                        var cb = function (err, res) {
                            if (err)
                                p(err);
                            p(res);
                        };
                        var createAccountTemplate = "\n        transaction(publicKeys: [String], contracts: {String: String}) {\n            prepare(signer: AuthAccount) {\n                let acct = AuthAccount(payer: signer)\n                for key in publicKeys {\n                    acct.addPublicKey(key.decodeHex())\n                }\n                for contract in contracts.keys {\n                    acct.contracts.add(name: contract, code: contracts[contract]!.decodeHex())\n                }\n            }\n        }";
                        var keys = [];
                        newAccountKeys === null || newAccountKeys === void 0 ? void 0 : newAccountKeys.forEach(function (k) {
                            if (typeof k == 'object') {
                                keys.push(encodePublicKeyForFlow(k));
                            }
                            else {
                                keys.push(encodePublicKeyForFlow({ public: k, weight: 1000 }));
                            }
                        });
                        var svcBuf = buffer_1.Buffer.from(_this.serviceAccountAddress, 'hex');
                        var prop = { address: svcBuf, privateKey: '', publicKey: '' };
                        _this.work.push({
                            type: FlowWorkType.TRANSACTION,
                            script: buffer_1.Buffer.from(createAccountTemplate, 'utf-8'),
                            arguments: [keys, new Map()],
                            payer: svcBuf,
                            proposer: prop,
                            authorizers: [prop],
                            payload_signatures: [],
                            envelope_signatures: [prop],
                            callback: cb,
                        });
                    })];
            });
        });
    };
    Flow.prototype.add_contract = function (contractName, contract, account) {
        return __awaiter(this, void 0, void 0, function () {
            var _this = this;
            return __generator(this, function (_a) {
                return [2 /*return*/, new Promise(function (p) {
                        var cb = function (err, res) {
                            if (err)
                                p(err);
                            p(res);
                        };
                        var addContractTemplate = "\n        transaction(name: String, code: String) {\n          prepare(signer: AuthAccount) {\n            signer.contracts.add(name: name, code: code.decodeHex())\n          }\n        }\n      ";
                        _this.work.push({
                            type: FlowWorkType.TRANSACTION,
                            script: buffer_1.Buffer.from(addContractTemplate, 'utf-8'),
                            arguments: [contractName, buffer_1.Buffer.from(contract, 'utf-8').toString('hex')],
                            payer: account.address,
                            proposer: account,
                            authorizers: [account],
                            payload_signatures: [],
                            envelope_signatures: [account],
                            callback: cb,
                        });
                    })];
            });
        });
    };
    Flow.prototype.add_key = function (key, account) {
        return __awaiter(this, void 0, void 0, function () {
            var _this = this;
            return __generator(this, function (_a) {
                return [2 /*return*/, new Promise(function (p) {
                        var cb = function (err, res) {
                            if (err)
                                p(err);
                            p(res);
                        };
                        var addKeyTemplate = "\n        transaction(publicKey: String) {\n            prepare(signer: AuthAccount) {\n                signer.addPublicKey(publicKey.decodeHex())\n            }\n        }\n      ";
                        var pubKey = encodePublicKeyForFlow(key);
                        _this.work.push({
                            type: FlowWorkType.TRANSACTION,
                            script: buffer_1.Buffer.from(addKeyTemplate, 'utf-8'),
                            arguments: [pubKey],
                            payer: account.address,
                            proposer: account,
                            authorizers: [account],
                            payload_signatures: [],
                            envelope_signatures: [account],
                            callback: cb,
                        });
                    })];
            });
        });
    };
    Flow.prototype.remove_key = function (keyIndex, account) {
        return __awaiter(this, void 0, void 0, function () {
            var _this = this;
            return __generator(this, function (_a) {
                return [2 /*return*/, new Promise(function (p) {
                        var cb = function (err, res) {
                            if (err)
                                p(err);
                            p(res);
                        };
                        var addKeyTemplate = "\n        transaction(keyIndex: Int) {\n            prepare(signer: AuthAccount) {\n                signer.removePublicKey(keyIndex)\n            }\n        }\n      ";
                        _this.work.push({
                            type: FlowWorkType.TRANSACTION,
                            script: buffer_1.Buffer.from(addKeyTemplate, 'utf-8'),
                            arguments: [keyIndex],
                            payer: account.address,
                            proposer: account,
                            authorizers: [account],
                            payload_signatures: [],
                            envelope_signatures: [account],
                            callback: cb,
                        });
                    })];
            });
        });
    };
    Flow.prototype.update_contract = function (contractName, contract, account) {
        return __awaiter(this, void 0, void 0, function () {
            var _this = this;
            return __generator(this, function (_a) {
                return [2 /*return*/, new Promise(function (p) {
                        var cb = function (err, res) {
                            if (err)
                                p(err);
                            p(res);
                        };
                        var updateContractTemplate = "\n        transaction(name: String, code: String) {\n          prepare(signer: AuthAccount) {\n            signer.contracts.update__experimental(name: name, code: code.decodeHex())\n          }\n        }\n      ";
                        _this.work.push({
                            type: FlowWorkType.TRANSACTION,
                            script: buffer_1.Buffer.from(updateContractTemplate, 'utf-8'),
                            arguments: [contractName, buffer_1.Buffer.from(contract, 'utf-8').toString('hex')],
                            payer: account.address,
                            proposer: account,
                            authorizers: [account],
                            payload_signatures: [],
                            envelope_signatures: [account],
                            callback: cb,
                        });
                    })];
            });
        });
    };
    Flow.prototype.remove_contract = function (contractName, account) {
        return __awaiter(this, void 0, void 0, function () {
            var _this = this;
            return __generator(this, function (_a) {
                return [2 /*return*/, new Promise(function (p) {
                        var cb = function (err, res) {
                            if (err)
                                p(err);
                            p(res);
                        };
                        var updateContractTemplate = "\n        transaction(name: String) {\n          prepare(signer: AuthAccount) {\n            signer.contracts.remove(name: name)\n          }\n        }\n      ";
                        _this.work.push({
                            type: FlowWorkType.TRANSACTION,
                            script: buffer_1.Buffer.from(updateContractTemplate, 'utf-8'),
                            arguments: [contractName],
                            payer: account.address,
                            proposer: account,
                            authorizers: [account],
                            payload_signatures: [],
                            envelope_signatures: [account],
                            callback: cb,
                        });
                    })];
            });
        });
    };
    Flow.prototype.get_block = function (blockId, blockHeight, sealed) {
        return __awaiter(this, void 0, void 0, function () {
            var isSealed;
            var _this = this;
            return __generator(this, function (_a) {
                isSealed = sealed ? sealed : false;
                return [2 /*return*/, new Promise(function (p) {
                        var cb = function (err, res) {
                            if (err)
                                p(err);
                            p(res['block']);
                        };
                        if (blockId) {
                            _this.work.push({
                                type: FlowWorkType.GetBlockByID,
                                arguments: [blockId, isSealed],
                                callback: cb,
                            });
                        }
                        else if (blockHeight) {
                            _this.work.push({
                                type: FlowWorkType.GetBlockByHeight,
                                arguments: [blockHeight, isSealed],
                                callback: cb,
                            });
                        }
                        else {
                            _this.work.push({
                                type: FlowWorkType.GetLatestBlock,
                                arguments: [isSealed],
                                callback: cb,
                            });
                        }
                    })];
            });
        });
    };
    return Flow;
}());
exports.Flow = Flow;
var FlowWorker = /** @class */ (function () {
    function FlowWorker(privKey, pubKey, id, network) {
        var debugLog = (0, debug_1.default)("FlowWorker::".concat(id, "::Constructor"));
        this.dbg = (0, debug_1.default)("FlowWorker::".concat(id));
        this.privKey = privKey;
        this.pubKey = pubKey;
        this.id = id;
        this.network = network;
        this.status = FlowWorkerStatus.CONNECTING;
        debugLog('Worker registered');
        debugLog('Loading Protobufs');
        var packageDefinition = protoLoader.loadSync('flow.proto', {
            keepCase: true,
            longs: String,
            enums: String,
            defaults: true,
            oneofs: true,
        });
        this.access = grpc.loadPackageDefinition(packageDefinition).flow['access'];
    }
    FlowWorker.prototype.connect = function () {
        return __awaiter(this, void 0, void 0, function () {
            var _this = this;
            return __generator(this, function (_a) {
                return [2 /*return*/, new Promise(function (p) {
                        _this.dbg('Connecting');
                        _this.client = new _this.access['AccessAPI'](_this.network, grpc.credentials.createInsecure());
                        _this.client.ping({}, function (err) {
                            if (err) {
                                _this.dbg('Error while connecting');
                                return Promise.reject(Error('Could not establish connection'));
                            }
                            else {
                                _this.status = FlowWorkerStatus.IDLE;
                                _this.dbg('Connection success');
                                p();
                            }
                        });
                    })];
            });
        });
    };
    FlowWorker.prototype.poll = function (work, transaction, p, timeout) {
        var _this = this;
        var to = timeout ? timeout : 50;
        this.client.getTransactionResult({ id: transaction }, function (e, tr) {
            switch (tr.status) {
                case 'UNKNOWN' || 'PENDING' || 'FINALIZED' || 'EXECUTED':
                    setTimeout(function () {
                        _this.poll(work, transaction, p, to + 200); // automatic backoff
                    }, to);
                    break;
                case 'SEALED':
                    processEvents(tr);
                    work.callback(e, tr);
                    _this.status = FlowWorkerStatus.IDLE;
                    p(); // resolve promise
                    break;
                default:
                    _this.dbg(tr);
                    work.callback(Error('Unknown error occurred while polling transaction, maybe it expired?'));
                    return Promise.reject(Error('Unknown error occurred while polling transaction, maybe it expired?'));
            }
        });
    };
    FlowWorker.prototype.getAccount = function (address) {
        var _this = this;
        return new Promise(function (p) {
            if (typeof address == 'string')
                address = buffer_1.Buffer.from(address, 'hex');
            _this.client.getAccountAtLatestBlock({ address: address }, function (err, res) {
                p(res['account']);
            });
        });
    };
    FlowWorker.prototype.getLatestBlock = function () {
        var _this = this;
        return new Promise(function (p) {
            _this.client.getLatestBlock({ is_sealed: false }, function (err, res) {
                if (err)
                    return Promise.reject(err);
                p(res['block']);
            });
        });
    };
    FlowWorker.prototype.process = function (work) {
        var _this = this;
        this.status = FlowWorkerStatus.PROCESSING;
        return new Promise(function (p) { return __awaiter(_this, void 0, void 0, function () {
            var _a, bufArg, acct, bufArg, args, tArgs, block, proposer, payer, mapR, propKey, transaction, finalPayload, finalEnvelope, _loop_1, this_1, _b, _c, ps, e_1_1, _loop_2, this_2, _d, _e, ps, e_2_1;
            var e_1, _f, e_2, _g;
            var _this = this;
            var _h;
            return __generator(this, function (_j) {
                switch (_j.label) {
                    case 0:
                        this.dbg('Processing', FlowWorkType[work.type]);
                        _a = work.type;
                        switch (_a) {
                            case FlowWorkType.GetAccountAtLatestBlock: return [3 /*break*/, 1];
                            case FlowWorkType.GetAccountAtBlockHeight: return [3 /*break*/, 5];
                            case FlowWorkType.GetLatestBlock: return [3 /*break*/, 6];
                            case FlowWorkType.SCRIPT: return [3 /*break*/, 7];
                            case FlowWorkType.TRANSACTION: return [3 /*break*/, 8];
                        }
                        return [3 /*break*/, 28];
                    case 1:
                        if (!(work.arguments.length == 1)) return [3 /*break*/, 3];
                        bufArg = buffer_1.Buffer.from(work.arguments[0].toString().replace(/\b0x/g, ''), 'hex');
                        return [4 /*yield*/, this.getAccount(bufArg)];
                    case 2:
                        acct = _j.sent();
                        work.callback(null, acct);
                        this.status = FlowWorkerStatus.IDLE;
                        p();
                        return [3 /*break*/, 4];
                    case 3:
                        work.callback(Error('incorrect number of arguments'));
                        this.status = FlowWorkerStatus.IDLE;
                        p();
                        _j.label = 4;
                    case 4: return [3 /*break*/, 29];
                    case 5:
                        if (work.arguments.length == 2) {
                            bufArg = buffer_1.Buffer.from(work.arguments[0].toString().replace(/\b0x/g, ''), 'hex');
                            this.client.getAccountAtBlockHeight({ address: bufArg, block_height: parseInt(work.arguments[1]) }, function (err, res) {
                                work.callback(err, res);
                                _this.status = FlowWorkerStatus.IDLE;
                                p();
                            });
                        }
                        else {
                            work.callback(Error('incorrect number of arguments'));
                            this.status = FlowWorkerStatus.IDLE;
                            p();
                        }
                        return [3 /*break*/, 29];
                    case 6:
                        if (work.arguments.length == 1) {
                            if (typeof work.arguments[0] !== 'boolean')
                                return [2 /*return*/, Promise.reject(Error("arg 0 must be a bool: GetLatestBlock, found ".concat(work.arguments[0])))];
                            this.client.getLatestBlock({ is_sealed: work.arguments[0] }, function (err, res) {
                                work.callback(err, res);
                                _this.status = FlowWorkerStatus.IDLE;
                                p();
                            });
                        }
                        else {
                            work.callback(Error('incorrect number of arguments'));
                            this.status = FlowWorkerStatus.IDLE;
                            p();
                        }
                        return [3 /*break*/, 29];
                    case 7:
                        args = argBuilder(work.arguments);
                        this.client.executeScriptAtLatestBlock({ script: work.script, arguments: args }, function (err, res) {
                            work.callback(err, res);
                            _this.status = FlowWorkerStatus.IDLE;
                            p();
                        });
                        return [3 /*break*/, 29];
                    case 8:
                        if (!work.proposer || ((_h = work.proposer) === null || _h === void 0 ? void 0 : _h.privateKey) == '')
                            work.proposer = { address: work.payer ? work.payer : buffer_1.Buffer.alloc(0), privateKey: this.privKey, publicKey: this.pubKey };
                        if (!work.payer)
                            work.payer = work.proposer.address;
                        tArgs = argBuilder(work.arguments);
                        return [4 /*yield*/, this.getLatestBlock()];
                    case 9:
                        block = _j.sent();
                        return [4 /*yield*/, this.getAccount(work.proposer.address)];
                    case 10:
                        proposer = _j.sent();
                        return [4 /*yield*/, this.getAccount(work.payer)];
                    case 11:
                        payer = _j.sent();
                        mapR = proposer.keys.map(function (x) {
                            var _a;
                            if (x.public_key.toString('hex') == ((_a = work.proposer) === null || _a === void 0 ? void 0 : _a.publicKey))
                                return [x.id, x.sequence_number];
                        })[0];
                        if (!mapR || mapR.length == 0)
                            return [2 /*return*/, Promise.reject(Error('Invalid proposer'))];
                        propKey = {
                            address: proposer.address,
                            key_id: mapR[0],
                            sequence_number: mapR[1],
                        };
                        if (!work.authorizers)
                            work.authorizers = [work.proposer];
                        if (work.authorizers.length == 0)
                            work.authorizers = [work.proposer];
                        transaction = {
                            script: work.script ? work.script : buffer_1.Buffer.from('', 'utf-8'),
                            arguments: tArgs,
                            reference_block_id: block.id,
                            gas_limit: 9999,
                            proposal_key: propKey,
                            payer: payer.address,
                            authorizers: work.authorizers ? work.authorizers.map(function (x) { return x.address; }) : [payer.address],
                            payload_signatures: [],
                            envelope_signatures: [],
                        };
                        finalPayload = [];
                        finalEnvelope = [];
                        _loop_1 = function (ps) {
                            var acct;
                            return __generator(this, function (_k) {
                                switch (_k.label) {
                                    case 0:
                                        if (finalPayload.filter(function (x) { return x.address == ps.address.toString('hex'); }).length > 0)
                                            return [2 /*return*/, "continue"];
                                        return [4 /*yield*/, this_1.getAccount(ps.address)];
                                    case 1:
                                        acct = _k.sent();
                                        if (ps.publicKey == '') {
                                            ps.publicKey = this_1.pubKey;
                                            ps.privateKey = this_1.privKey;
                                        }
                                        finalPayload.push({
                                            address: acct.address.toString('hex'),
                                            key_id: acct.keys.filter(function (k) { return k.public_key.toString('hex') == ps.publicKey; })[0].id,
                                            private_key: ps.privateKey,
                                        });
                                        return [2 /*return*/];
                                }
                            });
                        };
                        this_1 = this;
                        _j.label = 12;
                    case 12:
                        _j.trys.push([12, 17, 18, 19]);
                        _b = __values(work.payload_signatures ? work.payload_signatures : []), _c = _b.next();
                        _j.label = 13;
                    case 13:
                        if (!!_c.done) return [3 /*break*/, 16];
                        ps = _c.value;
                        return [5 /*yield**/, _loop_1(ps)];
                    case 14:
                        _j.sent();
                        _j.label = 15;
                    case 15:
                        _c = _b.next();
                        return [3 /*break*/, 13];
                    case 16: return [3 /*break*/, 19];
                    case 17:
                        e_1_1 = _j.sent();
                        e_1 = { error: e_1_1 };
                        return [3 /*break*/, 19];
                    case 18:
                        try {
                            if (_c && !_c.done && (_f = _b.return)) _f.call(_b);
                        }
                        finally { if (e_1) throw e_1.error; }
                        return [7 /*endfinally*/];
                    case 19:
                        _loop_2 = function (ps) {
                            var acct;
                            return __generator(this, function (_l) {
                                switch (_l.label) {
                                    case 0:
                                        if (finalEnvelope.filter(function (x) { return x.address == ps.address.toString('hex'); }).length > 0)
                                            return [2 /*return*/, "continue"];
                                        return [4 /*yield*/, this_2.getAccount(ps.address)];
                                    case 1:
                                        acct = _l.sent();
                                        if (ps.publicKey == '') {
                                            ps.publicKey = this_2.pubKey;
                                            ps.privateKey = this_2.privKey;
                                        }
                                        finalEnvelope.push({
                                            address: acct.address.toString('hex'),
                                            key_id: acct.keys.filter(function (k) { return k.public_key.toString('hex') == ps.publicKey; })[0].id,
                                            private_key: ps.privateKey,
                                        });
                                        return [2 /*return*/];
                                }
                            });
                        };
                        this_2 = this;
                        _j.label = 20;
                    case 20:
                        _j.trys.push([20, 25, 26, 27]);
                        _d = __values(work.envelope_signatures ? work.envelope_signatures : []), _e = _d.next();
                        _j.label = 21;
                    case 21:
                        if (!!_e.done) return [3 /*break*/, 24];
                        ps = _e.value;
                        return [5 /*yield**/, _loop_2(ps)];
                    case 22:
                        _j.sent();
                        _j.label = 23;
                    case 23:
                        _e = _d.next();
                        return [3 /*break*/, 21];
                    case 24: return [3 /*break*/, 27];
                    case 25:
                        e_2_1 = _j.sent();
                        e_2 = { error: e_2_1 };
                        return [3 /*break*/, 27];
                    case 26:
                        try {
                            if (_e && !_e.done && (_g = _d.return)) _g.call(_d);
                        }
                        finally { if (e_2) throw e_2.error; }
                        return [7 /*endfinally*/];
                    case 27:
                        transaction = signTransaction(transaction, finalPayload, finalEnvelope);
                        this.client.sendTransaction({ transaction: transaction }, function (err, trans) {
                            if (err)
                                return Promise.reject(err);
                            _this.poll(work, trans.id, p);
                        });
                        return [3 /*break*/, 29];
                    case 28:
                        this.dbg(FlowWorkType[work.type], 'is not implemented.');
                        work.callback(Error("".concat(FlowWorkType[work.type], " is not implemented")));
                        this.status = FlowWorkerStatus.IDLE;
                        p();
                        return [3 /*break*/, 29];
                    case 29: return [2 /*return*/];
                }
            });
        }); });
    };
    return FlowWorker;
}());
