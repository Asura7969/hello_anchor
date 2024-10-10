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
const anchor_1 = require("@coral-xyz/anchor");
const chai_1 = require("chai");
function play(program, game, player, tile, expectedTurn, expectedGameState, expectedBoard) {
    return __awaiter(this, void 0, void 0, function* () {
        yield program.methods
            .play(tile)
            .accounts({
            player: player.publicKey,
            game
        })
            .signers(player instanceof anchor.Wallet ? [] : [player])
            .rpc();
        const gameState = yield program.account.game.fetch(game);
        (0, chai_1.expect)(gameState.turn).to.equal(expectedTurn);
        (0, chai_1.expect)(gameState.state).to.eql(expectedGameState);
        (0, chai_1.expect)(gameState.board)
            .to
            .eql(expectedBoard);
    });
}
describe('game', () => {
    // Configure the client to use the local cluster.
    anchor.setProvider(anchor.AnchorProvider.local("http://localhost:8899"));
    const program = anchor.workspace.Game;
    const programProvider = program.provider;
    it('setup game!', () => __awaiter(void 0, void 0, void 0, function* () {
        const gameKeypair = anchor.web3.Keypair.generate();
        const playerOne = programProvider.wallet;
        const playerTwo = anchor.web3.Keypair.generate();
        yield program.methods
            .setupGame(playerTwo.publicKey)
            .accounts({
            game: gameKeypair.publicKey,
            playerOne: playerOne.publicKey,
        })
            .signers([gameKeypair])
            .rpc();
        let gameState = yield program.account.game.fetch(gameKeypair.publicKey);
        (0, chai_1.expect)(gameState.turn).to.equal(1);
        (0, chai_1.expect)(gameState.players)
            .to
            .eql([playerOne.publicKey, playerTwo.publicKey]);
        (0, chai_1.expect)(gameState.state).to.eql({ active: {} });
        (0, chai_1.expect)(gameState.board)
            .to
            .eql([[null, null, null], [null, null, null], [null, null, null]]);
    }));
    it('player one wins!', () => __awaiter(void 0, void 0, void 0, function* () {
        const gameKeypair = anchor.web3.Keypair.generate();
        const playerOne = programProvider.wallet;
        const playerTwo = anchor.web3.Keypair.generate();
        yield program.methods
            .setupGame(playerTwo.publicKey)
            .accounts({
            game: gameKeypair.publicKey,
            playerOne: playerOne.publicKey,
        })
            .signers([gameKeypair])
            .rpc();
        let gameState = yield program.account.game.fetch(gameKeypair.publicKey);
        (0, chai_1.expect)(gameState.turn).to.equal(1);
        (0, chai_1.expect)(gameState.players)
            .to
            .eql([playerOne.publicKey, playerTwo.publicKey]);
        (0, chai_1.expect)(gameState.state).to.eql({ active: {} });
        (0, chai_1.expect)(gameState.board)
            .to
            .eql([[null, null, null], [null, null, null], [null, null, null]]);
        yield play(program, gameKeypair.publicKey, playerOne, { row: 0, column: 0 }, 2, { active: {}, }, [
            [{ x: {} }, null, null],
            [null, null, null],
            [null, null, null]
        ]);
        try {
            yield play(program, gameKeypair.publicKey, playerOne, // same player in subsequent turns
            // change sth about the tx because
            // duplicate tx that come in too fast
            // after each other may get dropped
            { row: 1, column: 0 }, 2, { active: {}, }, [
                [{ x: {} }, null, null],
                [null, null, null],
                [null, null, null]
            ]);
            chai.assert(false, "should've failed but didn't ");
        }
        catch (_err) {
            (0, chai_1.expect)(_err).to.be.instanceOf(anchor_1.AnchorError);
            const err = _err;
            (0, chai_1.expect)(err.error.errorCode.code).to.equal("NotPlayersTurn");
            (0, chai_1.expect)(err.error.errorCode.number).to.equal(6003);
            (0, chai_1.expect)(err.program.equals(program.programId)).is.true;
            (0, chai_1.expect)(err.error.comparedValues).to.deep.equal([playerTwo.publicKey, playerOne.publicKey]);
        }
        yield play(program, gameKeypair.publicKey, playerTwo, { row: 1, column: 0 }, 3, { active: {}, }, [
            [{ x: {} }, null, null],
            [{ o: {} }, null, null],
            [null, null, null]
        ]);
        yield play(program, gameKeypair.publicKey, playerOne, { row: 0, column: 1 }, 4, { active: {}, }, [
            [{ x: {} }, { x: {} }, null],
            [{ o: {} }, null, null],
            [null, null, null]
        ]);
        try {
            yield play(program, gameKeypair.publicKey, playerTwo, { row: 5, column: 1 }, // out of bounds row
            4, { active: {}, }, [
                [{ x: {} }, { x: {} }, null],
                [{ o: {} }, null, null],
                [null, null, null]
            ]);
            chai.assert(false, "should've failed but didn't ");
        }
        catch (_err) {
            (0, chai_1.expect)(_err).to.be.instanceOf(anchor_1.AnchorError);
            const err = _err;
            (0, chai_1.expect)(err.error.errorCode.number).to.equal(6000);
            (0, chai_1.expect)(err.error.errorCode.code).to.equal("TileOutOfBounds");
        }
        yield play(program, gameKeypair.publicKey, playerTwo, { row: 1, column: 1 }, 5, { active: {}, }, [
            [{ x: {} }, { x: {} }, null],
            [{ o: {} }, { o: {} }, null],
            [null, null, null]
        ]);
        try {
            yield play(program, gameKeypair.publicKey, playerOne, { row: 0, column: 0 }, 5, { active: {}, }, [
                [{ x: {} }, { x: {} }, null],
                [{ o: {} }, { o: {} }, null],
                [null, null, null]
            ]);
            chai.assert(false, "should've failed but didn't ");
        }
        catch (_err) {
            (0, chai_1.expect)(_err).to.be.instanceOf(anchor_1.AnchorError);
            const err = _err;
            (0, chai_1.expect)(err.error.errorCode.number).to.equal(6001);
        }
        yield play(program, gameKeypair.publicKey, playerOne, { row: 0, column: 2 }, 5, { won: { winner: playerOne.publicKey }, }, [
            [{ x: {} }, { x: {} }, { x: {} }],
            [{ o: {} }, { o: {} }, null],
            [null, null, null]
        ]);
        try {
            yield play(program, gameKeypair.publicKey, playerOne, { row: 0, column: 2 }, 5, { won: { winner: playerOne.publicKey }, }, [
                [{ x: {} }, { x: {} }, { x: {} }],
                [{ o: {} }, { o: {} }, null],
                [null, null, null]
            ]);
            chai.assert(false, "should've failed but didn't ");
        }
        catch (_err) {
            (0, chai_1.expect)(_err).to.be.instanceOf(anchor_1.AnchorError);
            const err = _err;
            (0, chai_1.expect)(err.error.errorCode.number).to.equal(6002);
        }
    }));
    it('tie', () => __awaiter(void 0, void 0, void 0, function* () {
        const gameKeypair = anchor.web3.Keypair.generate();
        const playerOne = programProvider.wallet;
        const playerTwo = anchor.web3.Keypair.generate();
        yield program.methods
            .setupGame(playerTwo.publicKey)
            .accounts({
            game: gameKeypair.publicKey,
            playerOne: playerOne.publicKey,
        })
            .signers([gameKeypair])
            .rpc();
        let gameState = yield program.account.game.fetch(gameKeypair.publicKey);
        (0, chai_1.expect)(gameState.turn).to.equal(1);
        (0, chai_1.expect)(gameState.players)
            .to
            .eql([playerOne.publicKey, playerTwo.publicKey]);
        (0, chai_1.expect)(gameState.state).to.eql({ active: {} });
        (0, chai_1.expect)(gameState.board)
            .to
            .eql([[null, null, null], [null, null, null], [null, null, null]]);
        yield play(program, gameKeypair.publicKey, playerOne, { row: 0, column: 0 }, 2, { active: {}, }, [
            [{ x: {} }, null, null],
            [null, null, null],
            [null, null, null]
        ]);
        yield play(program, gameKeypair.publicKey, playerTwo, { row: 1, column: 1 }, 3, { active: {}, }, [
            [{ x: {} }, null, null],
            [null, { o: {} }, null],
            [null, null, null]
        ]);
        yield play(program, gameKeypair.publicKey, playerOne, { row: 2, column: 0 }, 4, { active: {}, }, [
            [{ x: {} }, null, null],
            [null, { o: {} }, null],
            [{ x: {} }, null, null]
        ]);
        yield play(program, gameKeypair.publicKey, playerTwo, { row: 1, column: 0 }, 5, { active: {}, }, [
            [{ x: {} }, null, null],
            [{ o: {} }, { o: {} }, null],
            [{ x: {} }, null, null]
        ]);
        yield play(program, gameKeypair.publicKey, playerOne, { row: 1, column: 2 }, 6, { active: {}, }, [
            [{ x: {} }, null, null],
            [{ o: {} }, { o: {} }, { x: {} }],
            [{ x: {} }, null, null]
        ]);
        yield play(program, gameKeypair.publicKey, playerTwo, { row: 0, column: 1 }, 7, { active: {}, }, [
            [{ x: {} }, { o: {} }, null],
            [{ o: {} }, { o: {} }, { x: {} }],
            [{ x: {} }, null, null]
        ]);
        yield play(program, gameKeypair.publicKey, playerOne, { row: 2, column: 1 }, 8, { active: {}, }, [
            [{ x: {} }, { o: {} }, null],
            [{ o: {} }, { o: {} }, { x: {} }],
            [{ x: {} }, { x: {} }, null]
        ]);
        yield play(program, gameKeypair.publicKey, playerTwo, { row: 2, column: 2 }, 9, { active: {}, }, [
            [{ x: {} }, { o: {} }, null],
            [{ o: {} }, { o: {} }, { x: {} }],
            [{ x: {} }, { x: {} }, { o: {} }]
        ]);
        yield play(program, gameKeypair.publicKey, playerOne, { row: 0, column: 2 }, 9, { tie: {}, }, [
            [{ x: {} }, { o: {} }, { x: {} }],
            [{ o: {} }, { o: {} }, { x: {} }],
            [{ x: {} }, { x: {} }, { o: {} }]
        ]);
    }));
});
