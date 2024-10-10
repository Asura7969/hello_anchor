// @ts-ignore
import * as anchor from "@coral-xyz/anchor";
// @ts-ignore
import { Program } from "@coral-xyz/anchor";
import { HelloAnchor } from "../target/types/hello_anchor";

describe("hello_anchor", () => {
  // Configure the client to use the local cluster.
    const provider = anchor.AnchorProvider.env();
    anchor.setProvider(provider);
    const program = anchor.workspace.HelloAnchor as Program<HelloAnchor>;
    const user = provider.wallet.publicKey;

    // @ts-ignore
    const seeds = Buffer.from("guessing pda");
    const [guessingPdaPubkey] = anchor.web3.PublicKey.findProgramAddressSync(
          [seeds],
          program.programId
    );

  it("initialized", async () => {
// Add your test here.
//       const tx = await program.methods.initialize().rpc();
//       console.log("Your transaction signature", tx);

      const initializeTx = await program.methods
          .initialize()
          .accounts({
              guessingAccount: guessingPdaPubkey,
              payer: user,
              systemProgram: anchor.web3.SystemProgram.programId,
          })
          .rpc();
      console.log(
          "Initialize successfully!\n Your transaction signature is:",
          initializeTx
      );

  });

  it("guessing", async () => {
      const guessingTx = await program.methods
          .guess(5)
          .accounts({
              guessingAccount: guessingPdaPubkey,
              payer: user,
              systemProgram: anchor.web3.SystemProgram.programId,
          })
          .rpc();
      // @ts-ignore
      console.log("Congratulation you're right!");
  });
});
