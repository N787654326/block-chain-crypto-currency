"use strict";
// required npm install blind-signatures
const blindSignatures = require('blind-signatures');

const { Coin, COIN_RIS_LENGTH, IDENT_STR, BANK_STR } = require('./coin.js');
const utils = require('./utils.js');

// Details about the bank's key.
const BANK_KEY = blindSignatures.keyGeneration({ b: 2048 });
const N = BANK_KEY.keyPair.n.toString();
const E = BANK_KEY.keyPair.e.toString();

/**
 * Function signing the coin on behalf of the bank.
 * 
 * @param blindedCoinHash - the blinded hash of the coin.
 * 
 * @returns the signature of the bank for this coin.
 */
function signCoin(blindedCoinHash) {
    console.log("Signing blindedCoinHash:", blindedCoinHash); // ✅ طباعة لمراجعة القيمة
    if (!blindedCoinHash) {
        throw new Error("Error: blindedCoinHash is undefined!");
    }
    return blindSignatures.sign({
        blinded: blindedCoinHash,
        key: BANK_KEY,
    });
}

/**
 * Parses a string representing a coin, and returns the left/right identity string hashes.
 */
function parseCoin(s) {
    let [cnst, amt, guid, leftHashes, rightHashes] = s.split('-');
    if (cnst !== BANK_STR) {
        throw new Error(`Invalid identity string: ${cnst} received, but ${BANK_STR} expected`);
    }
    let lh = leftHashes.split(',');
    let rh = rightHashes.split(',');
    return [lh, rh];
}

/**
 * Procedure for a merchant accepting a token.
 */
function acceptCoin(coin) {
    console.log("Verifying signature...");
    if (!blindSignatures.verify({
        unblinded: coin.signature,
        N: coin.N,
        E: coin.E,
        message: coin.hashed
    })) {
        throw new Error("Invalid signature!");
    }

    let [lh, rh] = parseCoin(coin.toString());
    let selected = Math.random() < 0.5 ? lh : rh;
    console.log("Selected RIS:", selected);
    return selected;
}

/**
 * Function to determine who is the cheater.
 */
function determineCheater(guid, ris1, ris2) {
    let cheaterFound = false;

    for (let i = 0; i < ris1.length; i++) {
        let xorResult = utils.xorHex(ris1[i], ris2[i]);
        if (xorResult.startsWith(IDENT_STR)) {
            console.log(`🛑 Alice is the cheater! Her ID is: ${xorResult}`);
            cheaterFound = true;
            break;
        }
    }

    if (!cheaterFound) {
        console.log("🛑 The merchant is the cheater!");
    }
}

// Create a coin
let coin = new Coin('alice', 20, N, E);

console.log("Blinded Coin:", coin.blinded);

// Sign and unblind the coin
coin.signature = signCoin(coin.blinded);
coin.unblind();

// Merchant 1 accepts the coin.
let ris1 = acceptCoin(coin);

// Merchant 2 accepts the same coin.
let ris2 = acceptCoin(coin);

// Determine who cheated
determineCheater(coin.guid, ris1, ris2);
determineCheater(coin.guid, ris1, ris1);
