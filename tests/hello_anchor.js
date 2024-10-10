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
// @ts-ignore
const anchor = __importStar(require("@coral-xyz/anchor"));
describe("hello_anchor", () => {
    // Configure the client to use the local cluster.
    const provider = anchor.AnchorProvider.env();
    anchor.setProvider(provider);
    const program = anchor.workspace.HelloAnchor;
    const user = provider.wallet.publicKey;
    // @ts-ignore
    const seeds = Buffer.from("guessing pda");
    const [guessingPdaPubkey] = anchor.web3.PublicKey.findProgramAddressSync([seeds], program.programId);
    it("initialized", () => __awaiter(void 0, void 0, void 0, function* () {
        // Add your test here.
        //       const tx = await program.methods.initialize().rpc();
        //       console.log("Your transaction signature", tx);
        const initializeTx = yield program.methods
            .initialize()
            .accounts({
            guessingAccount: guessingPdaPubkey,
            payer: user,
            systemProgram: anchor.web3.SystemProgram.programId,
        })
            .rpc();
        console.log("Initialize successfully!\n Your transaction signature is:", initializeTx);
    }));
    it("guessing", () => __awaiter(void 0, void 0, void 0, function* () {
        const guessingTx = yield program.methods
            .guess(5)
            .accounts({
            guessingAccount: guessingPdaPubkey,
            payer: user,
            systemProgram: anchor.web3.SystemProgram.programId,
        })
            .rpc();
        // @ts-ignore
        console.log("Congratulation you're right!");
    }));
});
