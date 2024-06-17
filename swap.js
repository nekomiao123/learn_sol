import { Keypair, Connection, LAMPORTS_PER_SOL, PublicKey, Transaction,
    SystemProgram, sendAndConfirmTransaction, VersionedTransaction } from "@solana/web3.js"
import "dotenv/config"
import bs58 from "bs58";
import { Wallet } from "@project-serum/anchor";
import { createJupiterApiClient } from '@jup-ag/api';
// import { transactionSenderAndConfirmationWaiter } from "./utils/transactionSender";
// import { getSignature } from "./utils/getSignature";


function getSignature(transaction) {
        const signature =
            "signature" in transaction
                ? transaction.signature
                : transaction.signatures[0];
        if (!signature) {
            throw new Error(
                "Missing transaction signature, the transaction was not signed by the fee payer"
            );
        }
        return bs58.encode(signature);
}

async function main() {
    const wallet = new Wallet(
        Keypair.fromSecretKey(bs58.decode(process.env.SECRET_KEY || ""))
    );
    console.log("Wallet:", wallet.publicKey.toBase58());

    // Devnet
    const devConnection = new Connection("https://api.devnet.solana.com");
    // jupiter
    const jupiterQuoteApi = createJupiterApiClient();

    // get quote
    const quote = await jupiterQuoteApi.quoteGet({
        inputMint: "So11111111111111111111111111111111111111112",
        outputMint: "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v",
        amount: "100000000",
        slippageBps: 5,
        onlyDirectRoutes: false,
        asLegacyTransaction: false,
    });


    if (!quote) {
        console.error("unable to quote");
        return;
    }

    // Get serialized transaction
    const swapResult = await jupiterQuoteApi.swapPost({
        swapRequest: {
        quoteResponse: quote,
        userPublicKey: wallet.publicKey.toBase58(),
        dynamicComputeUnitLimit: true,
        prioritizationFeeLamports: "auto",
        // prioritizationFeeLamports: {
        //   autoMultiplier: 2,
        // },
        },
    });

    console.dir(swapResult, { depth: null });

    // Serialize the transaction
    const swapTransactionBuf = Buffer.from(swapResult.swapTransaction, "base64");
    var transaction = VersionedTransaction.deserialize(swapTransactionBuf);

    // Sign the transaction
    transaction.sign([wallet.payer]);
    const signature = getSignature(transaction);

    // We first simulate whether the transaction would be successful
    const { value: simulatedTransactionResponse } =
    await devConnection.simulateTransaction(transaction, {
        replaceRecentBlockhash: true,
        commitment: "processed",
    });

    const { err, logs } = simulatedTransactionResponse;

    if (err) {
    // Simulation error, we can check the logs for more details
    // If you are getting an invalid account error, make sure that you have the input mint account to actually swap from.
        console.error("Simulation Error:");
        console.error({ err, logs });
        return;
    }

    const serializedTransaction = Buffer.from(transaction.serialize());
    const blockhash = transaction.message.recentBlockhash;

    const transactionResponse = await transactionSenderAndConfirmationWaiter({
        devConnection,
        serializedTransaction,
        blockhashWithExpiryBlockHeight: {
        blockhash,
        lastValidBlockHeight: swapResult.lastValidBlockHeight,
        },
    });

    // If we are not getting a response back, the transaction has not confirmed.
    if (!transactionResponse) {
        console.error("Transaction not confirmed");
        return;
    }

    if (transactionResponse.meta?.err) {
        console.error(transactionResponse.meta?.err);
    }

    console.log(`https://solscan.io/tx/${signature}`);
}

main()

