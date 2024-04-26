import { Keypair, Connection, LAMPORTS_PER_SOL, PublicKey } from "@solana/web3.js"

import "dotenv/config"
import base58 from "bs58"

// Generate wallet
// const keypair = Keypair.generate()

// console.log('The public key is :', keypair.publicKey.toBase58())

// console.log('The secret key is :', base58.encode(keypair.secretKey))

const userKeypair = Keypair.fromSecretKey(base58.decode(process.env.SECRET_KEY))

// console.log('The public key is :', userKeypair.publicKey.toBase58())

// console.log('The private key is :', base58.encode(userKeypair.secretKey))

// Devnet
const devConnection = new Connection("https://api.devnet.solana.com")

const add = userKeypair.publicKey.toBase58()
const userAdd = new PublicKey(add)

const balance = await devConnection.getBalance(userAdd)
console.log(balance)

const balanceSol = balance / LAMPORTS_PER_SOL

console.log(`Account ${userAdd} balance ${balanceSol} SOL`)



