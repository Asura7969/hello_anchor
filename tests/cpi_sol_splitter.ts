import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { CpiSolSplitter } from "../target/types/cpi_sol_splitter";

describe("sol_splitter", () => {
    // Configure the client to use the local cluster.
    anchor.setProvider(anchor.AnchorProvider.env());

    const program = anchor.workspace.CpiSolSplitter as Program<CpiSolSplitter>;

    async function printAccountBalance(account) {
        const balance = await anchor.getProvider().connection.getBalance(account);
        console.log(`${account} has ${balance / anchor.web3.LAMPORTS_PER_SOL} SOL`);
    }

    it("Transmit SOL one by one", async () => {
        // generate a new wallet
        const recipient = anchor.web3.Keypair.generate();

        await printAccountBalance(recipient.publicKey);

        // send the account 1 SOL via the program
        let amount = new anchor.BN(1 * anchor.web3.LAMPORTS_PER_SOL);
        await program.methods.sendSol(amount)
            .accounts({recipient: recipient.publicKey})
            .rpc();

        await printAccountBalance(recipient.publicKey);
    });

    it("Transmit SOL one to more", async () => {
        const recipient1 = anchor.web3.Keypair.generate();
        const recipient2 = anchor.web3.Keypair.generate();
        const recipient3 = anchor.web3.Keypair.generate();

        await printAccountBalance(recipient1.publicKey);
        await printAccountBalance(recipient2.publicKey);
        await printAccountBalance(recipient3.publicKey);

        const accountMeta1 = {pubkey: recipient1.publicKey, isWritable: true, isSigner: false};
        const accountMeta2 = {pubkey: recipient2.publicKey, isWritable: true, isSigner: false};
        const accountMeta3 = {pubkey: recipient3.publicKey, isWritable: true, isSigner: false};

        let amount = new anchor.BN(1 * anchor.web3.LAMPORTS_PER_SOL);
        await program.methods.sendSolToMore(amount)
            .remainingAccounts([accountMeta1, accountMeta2, accountMeta3])
            .rpc();

        await printAccountBalance(recipient1.publicKey);
        await printAccountBalance(recipient2.publicKey);
        await printAccountBalance(recipient3.publicKey);
    });
});
