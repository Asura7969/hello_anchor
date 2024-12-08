// @ts-ignore
import * as anchor from "@coral-xyz/anchor";
// @ts-ignore
import { Program } from "@coral-xyz/anchor";
import { Journal } from "../target/types/journal";


describe("journal", () => {
    // Configure the client to use the local cluster.
    const provider = anchor.AnchorProvider.env();
    const program = anchor.workspace.Journal as Program<Journal>;
    const user = provider.wallet.publicKey;

    const seeds = Buffer.from("title");
    const [myStorage, _bump] = anchor.web3.PublicKey.findProgramAddressSync(
        [seeds, user.toBuffer()],
        program.programId
    );

    it("create", async () => {
        try {
            const initializeTx = await program.methods
                .createJournalEntry("title", "测试数据")
                .accounts({
                    journalEntry: myStorage,
                    owner: user,
                    systemProgram: anchor.web3.SystemProgram.programId,
                })
                .rpc();
            console.log(
                "Initialize successfully!\n Your transaction signature is:",
                initializeTx
            );
        } catch (error) {
            console.log(error);
        }
    });

    it("update", async () => {
        const guessingTx = await program.methods
            .updateJournalEntry("title", "新-测试数据")
            .accounts({
                journalEntry: myStorage,
                payer: user,
                systemProgram: anchor.web3.SystemProgram.programId,
            })
            .rpc();
        // @ts-ignore
        console.log("Congratulation you're right!");
    });

    it("delete", async () => {
        const guessingTx = await program.methods
            .deleteJournalEntry("title")
            .accounts({
                journalEntry: myStorage,
                payer: user,
                systemProgram: anchor.web3.SystemProgram.programId,
            })
            .rpc();
        // @ts-ignore
        console.log("Congratulation you're right!");
    });

    it("query", async () => {
        console.log("the storage account address is", myStorage.toBase58());
        let entry = await program.account.journalEntryState.fetch(myStorage);
        console.log("title is:", entry.title.toString());
        console.log("message is:", entry.title.toString());
    });
});
