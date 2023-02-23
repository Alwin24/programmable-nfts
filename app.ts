import { Connection, Keypair, PublicKey, clusterApiUrl } from '@solana/web3.js'
import {
	Metaplex,
	keypairIdentity,
	bundlrStorage,
	toMetaplexFile,
	toBigNumber,
	walletAdapterIdentity,
	transferNftBuilder,
} from '@metaplex-foundation/js'
import { TokenStandard, createTransferInstruction } from '@metaplex-foundation/mpl-token-metadata'
import { readFileSync } from 'fs'

const QUICKNODE_RPC = clusterApiUrl('devnet')
const SOLANA_CONNECTION = new Connection(QUICKNODE_RPC)
const WALLET = Keypair.fromSecretKey(
	new Uint8Array(JSON.parse(readFileSync('/home/alwin/second-wallet/second-keypair.json', 'utf8')))
)

const metaplex = Metaplex.make(SOLANA_CONNECTION)
// const metaplex = Metaplex.make(SOLANA_CONNECTION).use(keypairIdentity(WALLET))
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
	try {
		let mintTxnBuilder = await metaplex
			.nfts()
			.builders()
			.create({
				uri: metadataUri,
				name: name,
				sellerFeeBasisPoints: sellerFee,
				symbol: symbol,
				creators: creators,
				isMutable: true,
				isCollection: false,
				maxSupply: toBigNumber(1),
				tokenStandard: TokenStandard.ProgrammableNonFungible,
				ruleSet: null,
			})

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

		console.log(
			'Signers :',
			transferTxnBuilder.getSigners().map((signer) => signer.publicKey.toBase58())
		)

		let delegateTxnBuilder = metaplex
			.nfts()
			.builders()
			.delegate({
				nftOrSft: {
					tokenStandard: TokenStandard.ProgrammableNonFungible,
					address: new PublicKey('Cf6SV5WiwsmAFU1ZLh1aD2MazyQBYpSDA2AVHxUHwGgS'),
				},
				delegate: {
					delegate: new PublicKey('HtUaVzWiSNrrY2NSVKroE3883vnBfn8SMrLM2UxA2vDy'),
					owner: WALLET.publicKey,
					type: 'TransferV1',
					data: {
						amount: toBigNumber(1),
					},
				},
			})

		delegateTxnBuilder.add(
			metaplex
				.nfts()
				.builders()
				.freezeDelegatedNft({
					mintAddress: new PublicKey('Cf6SV5WiwsmAFU1ZLh1aD2MazyQBYpSDA2AVHxUHwGgS'),
					delegateAuthority: WALLET,
				})
		)

		let { signature, confirmResponse } = await metaplex.rpc().sendAndConfirmTransaction(delegateTxnBuilder)
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
