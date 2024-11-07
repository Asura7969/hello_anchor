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
// this airdrops sol to an address
function airdropSol(publicKey, amount) {
    return __awaiter(this, void 0, void 0, function* () {
        let airdropTx = yield anchor.getProvider().connection.requestAirdrop(publicKey, amount);
        yield confirmTransaction(airdropTx);
    });
}
function confirmTransaction(tx) {
    return __awaiter(this, void 0, void 0, function* () {
        const latestBlockHash = yield anchor.getProvider().connection.getLatestBlockhash();
        yield anchor.getProvider().connection.confirmTransaction({
            blockhash: latestBlockHash.blockhash,
            lastValidBlockHeight: latestBlockHash.lastValidBlockHeight,
            signature: tx,
        });
    });
}
describe("points", () => {
    anchor.setProvider(anchor.AnchorProvider.env());
    const program = anchor.workspace.Points;
    it("Alice transfers points to Bob", () => __awaiter(void 0, void 0, void 0, function* () {
        const alice = anchor.web3.Keypair.generate();
        const bob = anchor.web3.Keypair.generate();
        const airdrop_alice_tx = yield anchor.getProvider().connection.requestAirdrop(alice.publicKey, 1 * anchor.web3.LAMPORTS_PER_SOL);
        yield confirmTransaction(airdrop_alice_tx);
        const airdrop_alice_bob = yield anchor.getProvider().connection.requestAirdrop(bob.publicKey, 1 * anchor.web3.LAMPORTS_PER_SOL);
        yield confirmTransaction(airdrop_alice_bob);
        let seeds_alice = [alice.publicKey.toBytes()];
        const [playerAlice, _bumpA] = anchor.web3.PublicKey.findProgramAddressSync(seeds_alice, program.programId);
        let seeds_bob = [bob.publicKey.toBytes()];
        const [playerBob, _bumpB] = anchor.web3.PublicKey.findProgramAddressSync(seeds_bob, program.programId);
        // Alice and Bob initialize their accounts
        yield program.methods.initialize().accounts({
            player: playerAlice,
            signer: alice.publicKey,
        }).signers([alice]).rpc();
        yield program.methods.initialize().accounts({
            player: playerBob,
            signer: bob.publicKey,
        }).signers([bob]).rpc();
        // Alice transfers 5 points to Bob. Note that this is a u32
        // so we don't need a BigNum
        yield program.methods.transferPoints(5).accounts({
            from: playerAlice,
            to: playerBob,
            authority: alice.publicKey,
        }).signers([alice]).rpc();
        console.log(`Alice has ${(yield program.account.player.fetch(playerAlice)).points} points`);
        console.log(`Bob has ${(yield program.account.player.fetch(playerBob)).points} points`);
    }));
});
