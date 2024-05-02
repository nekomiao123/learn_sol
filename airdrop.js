import { Connection, Keypair, LAMPORTS_PER_SOL} from "@solana/web3.js";
import "dotenv/config";
import base58 from "bs58";

(async () => {
  const keypair = Keypair.fromSecretKey(base58.decode(process.env.SECRET_KEY))

  const connection = new Connection("https://api.devnet.solana.com", "confirmed");

  const signature = await connection.requestAirdrop(
    keypair.publicKey,
    1 * LAMPORTS_PER_SOL
  );

  const { blockhash, lastValidBlockHeight } = await connection.getLatestBlockhash();
  await connection.confirmTransaction({
      blockhash,
      lastValidBlockHeight,
      signature
    });
})();



