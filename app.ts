import { Connection, Keypair, PublicKey, clusterApiUrl } from '@solana/web3.js'
import { Metaplex, keypairIdentity, bundlrStorage, toMetaplexFile, toBigNumber } from '@metaplex-foundation/js'
import { TokenStandard, createTransferInstruction } from '@metaplex-foundation/mpl-token-metadata'
import { readFileSync } from 'fs'

const QUICKNODE_RPC = clusterApiUrl('devnet')
const SOLANA_CONNECTION = new Connection(QUICKNODE_RPC)
const WALLET = Keypair.fromSecretKey(
	new Uint8Array(JSON.parse(readFileSync('/home/alwin/second-wallet/second-keypair.json', 'utf8')))
)

const metaplex = Metaplex.make(SOLANA_CONNECTION)
	.use(keypairIdentity(WALLET))
	// .use(
	// 	bundlrStorage({
	// 		address: 'https://devnet.bundlr.network',
	// 		providerUrl: QUICKNODE_RPC,
	// 		timeout: 60000,
	// 	})
	// )

const CONFIG = {
	imgName: 'QuickNode Pixel',
	symbol: 'QNPIX',
	sellerFeeBasisPoints: 500, //500 bp = 5%
	creators: [{ address: WALLET.publicKey, share: 100 }],
	metadata: 'https://arweave.net/yIgHNXiELgQqW8QIbFM9ibVV37jhvfyW3mFcZGRX-PA',
}

async function mintProgrammableNft(
	metadataUri: string,
	name: string,
	sellerFee: number,
	symbol: string,
	creators: { address: PublicKey; share: number }[]
) {
	console.log(`Minting pNFT`)
	try {
		// let mintTxnBuilder = await metaplex
		// 	.nfts()
		// 	.builders()
		// 	.create({
		// 		uri: metadataUri,
		// 		name: name,
		// 		sellerFeeBasisPoints: sellerFee,
		// 		symbol: symbol,
		// 		creators: creators,
		// 		isMutable: true,
		// 		isCollection: false,
		// 		maxSupply: toBigNumber(1),
		// 		tokenStandard: TokenStandard.ProgrammableNonFungible,
		// 		ruleSet: null,
		// 	})

		// let { signature, confirmResponse } = await metaplex.rpc().sendAndConfirmTransaction(mintTxnBuilder)
		// if (confirmResponse.value.err) {
		// 	throw new Error('failed to confirm transaction')
		// }

		// console.log(`Success!🎉`)
		// console.log(`Tx: https://explorer.solana.com/tx/${signature}?cluster=devnet`)

		let transferTxnBuilder = metaplex
			.nfts()
			.builders()
			.transfer({
				nftOrSft: {
					tokenStandard: TokenStandard.ProgrammableNonFungible,
					address: new PublicKey('Cf6SV5WiwsmAFU1ZLh1aD2MazyQBYpSDA2AVHxUHwGgS'),
				},
				toOwner: new PublicKey('BcSZEL6ryTaLS7unjzPuSLNgi1VVj6yxGKHJMMd44i5Z'),
			})

		let { signature, confirmResponse } = await metaplex.rpc().sendAndConfirmTransaction(transferTxnBuilder)
		if (confirmResponse.value.err) {
			throw new Error('failed to confirm transaction')
		}

		console.log(`Success!🎉`)
		console.log(`Tx: https://explorer.solana.com/tx/${signature}?cluster=devnet`)
	} catch (err) {
		console.log(err)
	}
}

mintProgrammableNft(CONFIG.metadata, CONFIG.imgName, CONFIG.sellerFeeBasisPoints, CONFIG.symbol, CONFIG.creators)
