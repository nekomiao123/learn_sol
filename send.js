import { Keypair, Connection, LAMPORTS_PER_SOL, PublicKey, Transaction,
SystemProgram, sendAndConfirmTransaction } from "@solana/web3.js"
import "dotenv/config"
import base58 from "bs58"

const userKeypair = Keypair.fromSecretKey(base58.decode(process.env.SECRET_KEY))

// Devnet
const devConnection = new Connection("https://api.devnet.solana.com")
// My address
const add = userKeypair.publicKey.toBase58()
const userAdd = new PublicKey(add)

// receive address
const toAdd = new PublicKey(process.env.PUBLIC_KEY)

// balance
let myBalance = await devConnection.getBalance(userAdd)
let toAddBalance = await devConnection.getBalance(toAdd)

let mySol = myBalance / LAMPORTS_PER_SOL
let reSol = toAddBalance / LAMPORTS_PER_SOL

console.log(`My ${userAdd} balance ${mySol} SOL`)
console.log(`Receive ${toAdd} balance ${reSol} SOL`)

// Transaction
const trans = new Transaction()

const sendSolInstruction = SystemProgram.transfer({
    fromPubkey: userAdd,
    toPubkey: toAdd,
    lamports: 0.5 * LAMPORTS_PER_SOL,
})

trans.add(sendSolInstruction)

let signature = await sendAndConfirmTransaction(devConnection, trans, [
    userKeypair,
])

console.log(
    `Send Successfully`
)

// balance
myBalance = await devConnection.getBalance(userAdd, 'confirmed')
toAddBalance = await devConnection.getBalance(toAdd, 'confirmed')

mySol = myBalance / LAMPORTS_PER_SOL
reSol = toAddBalance / LAMPORTS_PER_SOL

console.log(`My ${userAdd} balance ${mySol} SOL`)
console.log(`Receive ${toAdd} balance ${reSol} SOL`)

