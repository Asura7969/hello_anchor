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
describe("EnergyGame", () => {
    const provider = anchor.AnchorProvider.env();
    anchor.setProvider(provider);
    const program = anchor.workspace.EnergyGame;
    const payer = provider.wallet;
    const gameDataSeed = "gameData";
    it("Init player and chop tree!", () => __awaiter(void 0, void 0, void 0, function* () {
        console.log("Local address", payer.publicKey.toBase58());
        const balance = yield anchor
            .getProvider()
            .connection.getBalance(payer.publicKey);
        if (balance < 1e8) {
            const res = yield anchor
                .getProvider()
                .connection.requestAirdrop(payer.publicKey, 1e9);
            yield anchor
                .getProvider()
                .connection.confirmTransaction(res, "confirmed");
        }
        const [playerPDA] = anchor.web3.PublicKey.findProgramAddressSync([Buffer.from("player"), payer.publicKey.toBuffer()], program.programId);
        console.log("Player PDA", playerPDA.toBase58());
        const [gameDataPDA] = anchor.web3.PublicKey.findProgramAddressSync([Buffer.from(gameDataSeed)], program.programId);
        try {
            let tx = yield program.methods
                .initPlayer(gameDataSeed)
                .accountsStrict({
                player: playerPDA,
                signer: payer.publicKey,
                gameData: gameDataPDA,
                systemProgram: anchor.web3.SystemProgram.programId,
            })
                .rpc({ skipPreflight: true });
            console.log("Init transaction", tx);
            yield anchor.getProvider().connection.confirmTransaction(tx, "confirmed");
            console.log("Confirmed", tx);
        }
        catch (e) {
            console.log("Player already exists: ", e);
        }
        for (let i = 0; i < 11; i++) {
            console.log(`Chop instruction ${i}`);
            let tx = yield program.methods
                .chopTree(gameDataSeed, 0)
                .accountsStrict({
                player: playerPDA,
                sessionToken: null,
                signer: payer.publicKey,
                gameData: gameDataPDA,
                systemProgram: anchor.web3.SystemProgram.programId,
            })
                .rpc();
            console.log("Chop instruction", tx);
            yield anchor.getProvider().connection.confirmTransaction(tx, "confirmed");
        }
        const accountInfo = yield anchor
            .getProvider()
            .connection.getAccountInfo(playerPDA, "confirmed");
        const decoded = program.coder.accounts.decode("playerData", accountInfo.data);
        console.log("Player account info", JSON.stringify(decoded));
    }));
});
