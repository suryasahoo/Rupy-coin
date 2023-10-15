const algosdk = require('algosdk');
const fs = require('fs');
async function deployToken() {
    const accountData = JSON.parse(fs.readFileSync('account.json', 'utf8'));
    const { address, privateKey } = accountData;
    const privateKeyUint8 = new Uint8Array(Buffer.from(privateKey, 'base64'));
    console.log("Connecting to Algorand Testnet");
    const algodToken = {
        "x-api-key": "51sRjuxZPt4OwOIMkgWyN47LNZRRwYzA9kgkaNzJ" // fill in yours
    };
    const algodServer = 'https://testnet-algorand.api.purestake.io/ps2';
    const algodPort = "443";
    const algodClient = new algosdk.Algodv2(algodToken, algodServer, algodPort);
    const suggestedParams = await algodClient.getTransactionParams().do();
    console.log("Creating the Token Metadata");
    const txn = algosdk.makeAssetCreateTxnWithSuggestedParamsFromObject({
        from: address,
        suggestedParams,
        defaultFrozen: false,
        unitName: 'Rupy', // Symbol
        assetName: ' Rupy Coin', // Name of the asset
        manager: address,
        reserve: address,
        freeze: address,
        clawback: address,
        total: 1000,
        decimals: 0, // Decimals
    });
    const signedTxn = algosdk.signTransaction(txn, privateKeyUint8);
    await algodClient.sendRawTransaction(signedTxn.blob).do();
    const result = await algosdk.waitForConfirmation(algodClient, txn.txID().toString(), 3);
    console.log("Token deployed");
    const assetIndex = result['asset-index'];
    console.log(`Asset ID created: ${assetIndex}`);
    const url = `https://testnet.algoexplorer.io/asset/${assetIndex}`;
    console.log(`Asset URL: ${url}`);
    process.exit();
}
deployToken();