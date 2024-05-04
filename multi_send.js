import { Keypair, Connection, LAMPORTS_PER_SOL, PublicKey, Transaction,
SystemProgram, sendAndConfirmTransaction } from "@solana/web3.js"
import "dotenv/config"
import base58 from "bs58"

const userKeypair = Keypair.fromSecretKey(base58.decode(process.env.SECRET_KEY))

// Devnet
const devConnection = new Connection("https://api.devnet.solana.com")
// My address
const myAdd = userKeypair.publicKey.toBase58()
const userAdd = new PublicKey(myAdd)

// receive address 1 and 2
const re1Add = new PublicKey(process.env.PUBLIC_KEY)
const re2Add = new PublicKey(process.env.PUBLIC_KEY2)

// balance
let myBalance = await devConnection.getBalance(userAdd)
let re1Balance = await devConnection.getBalance(re1Add)
let re2Balance = await devConnection.getBalance(re2Add)

let mySol = myBalance / LAMPORTS_PER_SOL
let re1Sol = re1Balance / LAMPORTS_PER_SOL
let re2Sol = re2Balance / LAMPORTS_PER_SOL

console.log(`My ${userAdd} balance ${mySol} SOL`)
console.log(`Receive 1 ${re1Add} balance ${re1Sol} SOL`)
console.log(`Receive 2 ${re2Add} balance ${re2Sol} SOL`)

// Transaction
const trans = new Transaction()

const sendSolInstruction1 = SystemProgram.transfer({
    fromPubkey: userAdd,
    toPubkey: re1Add,
    lamports: 0.1 * LAMPORTS_PER_SOL,
})

const sendSolInstruction2 = SystemProgram.transfer({
    fromPubkey: userAdd,
    toPubkey: re2Add,
    lamports: 0.1 * LAMPORTS_PER_SOL,
})

trans.add(sendSolInstruction1)
trans.add(sendSolInstruction2)


let signature = await sendAndConfirmTransaction(devConnection, trans, [
    userKeypair,
])

console.log(
    `Send Successfully`
)

console.log(`Transaction Signature: ${signature}`)

// balance
myBalance = await devConnection.getBalance(userAdd, 'confirmed')
re1Balance = await devConnection.getBalance(re1Add, 'confirmed')
re2Balance = await devConnection.getBalance(re2Add, 'confirmed')

mySol = myBalance / LAMPORTS_PER_SOL
re1Sol = re1Balance / LAMPORTS_PER_SOL
re2Sol = re2Balance / LAMPORTS_PER_SOL

console.log(`My ${userAdd} balance ${mySol} SOL`)
console.log(`Receive 1 ${re1Add} balance ${re1Sol} SOL`)
console.log(`Receive 2 ${re2Add} balance ${re2Sol} SOL`)


