"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const anchor = __importStar(require("@coral-xyz/anchor"));
describe("sol_splitter", () => {
    // Configure the client to use the local cluster.
    anchor.setProvider(anchor.AnchorProvider.env());
    const program = anchor.workspace.CpiSolSplitter;
    function printAccountBalance(account) {
        return __awaiter(this, void 0, void 0, function* () {
            const balance = yield anchor.getProvider().connection.getBalance(account);
            console.log(`${account} has ${balance / anchor.web3.LAMPORTS_PER_SOL} SOL`);
        });
    }
    it("Transmit SOL one by one", () => __awaiter(void 0, void 0, void 0, function* () {
        // generate a new wallet
        const recipient = anchor.web3.Keypair.generate();
        yield printAccountBalance(recipient.publicKey);
        // send the account 1 SOL via the program
        let amount = new anchor.BN(1 * anchor.web3.LAMPORTS_PER_SOL);
        yield program.methods.sendSol(amount)
            .accounts({ recipient: recipient.publicKey })
            .rpc();
        yield printAccountBalance(recipient.publicKey);
    }));
    it("Transmit SOL one to more", () => __awaiter(void 0, void 0, void 0, function* () {
        const recipient1 = anchor.web3.Keypair.generate();
        const recipient2 = anchor.web3.Keypair.generate();
        const recipient3 = anchor.web3.Keypair.generate();
        yield printAccountBalance(recipient1.publicKey);
        yield printAccountBalance(recipient2.publicKey);
        yield printAccountBalance(recipient3.publicKey);
        const accountMeta1 = { pubkey: recipient1.publicKey, isWritable: true, isSigner: false };
        const accountMeta2 = { pubkey: recipient2.publicKey, isWritable: true, isSigner: false };
        const accountMeta3 = { pubkey: recipient3.publicKey, isWritable: true, isSigner: false };
        let amount = new anchor.BN(1 * anchor.web3.LAMPORTS_PER_SOL);
        yield program.methods.sendSolToMore(amount)
            .remainingAccounts([accountMeta1, accountMeta2, accountMeta3])
            .rpc();
        yield printAccountBalance(recipient1.publicKey);
        yield printAccountBalance(recipient2.publicKey);
        yield printAccountBalance(recipient3.publicKey);
    }));
});
