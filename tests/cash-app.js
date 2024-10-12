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
describe("cash-app", () => {
    const provider = anchor.AnchorProvider.env();
    const program = anchor.workspace.CashApp;
    it("A to B user flow", () => __awaiter(void 0, void 0, void 0, function* () {
        const myWallet = provider.wallet;
        const yourWallet = new anchor.web3.Keypair();
        const [myAccount] = yield anchor.web3.PublicKey.findProgramAddressSync([Buffer.from("cash-account"), myWallet.publicKey.toBuffer()], program.programId);
        const [yourAccount] = yield anchor.web3.PublicKey.findProgramAddressSync([Buffer.from("cash-account"), yourWallet.publicKey.toBuffer()], program.programId);
        console.log("requesting airdrop");
        const airdropTx = yield provider.connection.requestAirdrop(yourWallet.publicKey, 5 * anchor.web3.LAMPORTS_PER_SOL);
        yield provider.connection.confirmTransaction(airdropTx);
        let yourBalance = yield program.provider.connection.getBalance(yourWallet.publicKey);
        console.log("Your wallet balance:", yourBalance);
        const initMe = yield program.methods
            .initializeAccount()
            .accounts({
            cashAccount: myAccount,
            signer: myWallet.publicKey,
            systemProgram: anchor.web3.SystemProgram.programId,
        })
            .rpc();
        console.log(`Use 'solana confirm -v ${initMe}' to see the logs`);
        yield anchor.getProvider().connection.confirmTransaction(initMe);
        const initYou = yield program.methods
            .initializeAccount()
            .accounts({
            cashAccount: yourAccount,
            signer: yourWallet.publicKey,
            systemProgram: anchor.web3.SystemProgram.programId,
        })
            .signers([yourWallet])
            .rpc();
        console.log(`Initialized your account : ${initYou}' `);
        yield anchor.getProvider().connection.confirmTransaction(initYou);
    }));
});
