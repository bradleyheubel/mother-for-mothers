import {
  ActionPostResponse,
  ACTIONS_CORS_HEADERS,
  createPostResponse,
  ActionGetResponse,
  ActionPostRequest,
  createActionHeaders
} from "@solana/actions";
import {
  clusterApiUrl,
  Connection,
  LAMPORTS_PER_SOL,
  PublicKey,
  SystemProgram,
  Transaction,
  VersionedTransaction
} from '@solana/web3.js';
import * as splToken from '@solana/spl-token';
import axios from "axios";

const splPubkeyMap: Record<string, [string, number]> = {
["MOTHER"]: ["3S8qX1MsMqRbiwKg2cQyx7nis1oHMgaCuc9c4VfvVdPN", 6],
["USDC"]: ["EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v", 6],
["BONK"]: ["DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263", 5],
["WIF"]: ["EKpQGSJtjMFqKZ9KQanSqYXRcF8fBopzLHYxdM65zcjm", 6],
["USDT"]: ["Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB", 6]
}

const pubkeyToDonateTo = '4ypD7kxRj9DLF3PMxsY3qvp8YdNhAHZRnN3fyVDh5CFX'
const title = 'MOTHER for Mothers!'
const desc = "Other tokens are swapped to MOTHER (powered by Jup.ag)"
const successMsg = "Thank you for supporting your MOTHER!"

export const GET = async (req: Request) => {
  try {
    const requestUrl = new URL(req.url);
    const { toPubkey } = validatedQueryParams(requestUrl);

    const icon = `${requestUrl.origin}/mother.jpeg`

    const baseHref = new URL(
      `/api/swap?to=${toPubkey.toBase58()}`,
      requestUrl.origin,
    ).toString();

    let options : Array<any> = []
    Object.keys(splPubkeyMap).map(assetID => {
      if (assetID == "MOTHER"){
        options.push({
          selected: true,
          label: `${assetID}`,
          value: assetID,
        })
      } else {
        options.push({
          label: `${assetID}`,
          value: assetID,
        })
      }
    })
    options.splice(1, 0, {
      selected: false,
      label: `SOL`,
      value: "SOL",
    })

    const payload: ActionGetResponse = {
      title,
      icon,
      description:
        desc,
      label: 'Transfer', // this value will be ignored since `links.actions` exists
      links: {
        actions: [
          {
            label: 'Donate', // button text
            href: `${baseHref}&token={token}&amount={amount}`, // this href will have a text input
            parameters: [
              {
                type: "select",
                name: "token",
                options,
              },
              {
                type: "text",
                required: true,
                name: "amount",
                label: "Amount to send",
              },
            ],
          },
        ],
      },
    };

    return Response.json(payload, {
      headers: ACTIONS_CORS_HEADERS,
    });
  } catch (err) {
    console.log(err);
    let message = 'An unknown error occurred';
    if (typeof err == 'string') message = err;
    
    return new Response(message, {
      status: 400,
      headers: ACTIONS_CORS_HEADERS,
    });
  }
};


export const OPTIONS = GET;

export const POST = async (req: Request) => {
  const requestUrl = new URL(req.url);
  const { token, amount, toPubkey } = validatedQueryParams(requestUrl);

  const body: ActionPostRequest = await req.json();

  // validate the client provided input
  let account: PublicKey;
  try {
    account = new PublicKey(body.account);
  } catch (err) {
    return new Response('Invalid "account" provided', {
      status: 400,
      headers: ACTIONS_CORS_HEADERS,
    });
  }

  const connection = new Connection(
    process.env.SOLANA_RPC! || clusterApiUrl('mainnet-beta'),
    //clusterApiUrl("devnet"),
  );

  // ensure the receiving account will be rent exempt
  const minimumBalance = await connection.getMinimumBalanceForRentExemption(
    0, // note: simple accounts that just store native SOL have `0` bytes of data
  );
  if (amount * LAMPORTS_PER_SOL < minimumBalance) {
    throw `account may not be rent exempt: ${toPubkey.toBase58()}`;
  }

  let instructions = [];

  if (token == "SOL"){
    console.log("SOL")
    console.log(splPubkeyMap["MOTHER"][0])
        const quoteResponse = await (
          await fetch(`https://quote-api.jup.ag/v6/quote?inputMint=So11111111111111111111111111111111111111112&outputMint=${splPubkeyMap["MOTHER"][0]}&amount=${amount * LAMPORTS_PER_SOL}&slippageBps=50`
          )
        ).json();

        console.log(quoteResponse)

        const { swapTransaction } = await (
          await fetch('https://quote-api.jup.ag/v6/swap', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              // quoteResponse from /quote api
              quoteResponse,
              // user public key to be used for the swap
              userPublicKey: account,
              // auto wrap and unwrap SOL. default is true
              wrapAndUnwrapSol: true,
              // feeAccount is optional. Use if you want to charge a fee.  feeBps must have been passed in /quote API.
              // feeAccount: "fee_account_public_key"
              // asLegacyTransaction: true,
            })
          })
        ).json();
    console.log(swapTransaction)
    //instructions.push(swapTransaction)

      // create a legacy transaction
  const transaction = VersionedTransaction.deserialize(Buffer.from(swapTransaction, 'base64'))
  // const transaction = new Transaction({
  //   feePayer: account,
  //   blockhash,
  //   lastValidBlockHeight,
  // }).add(...instructions);
      
  const payload: ActionPostResponse = await createPostResponse({
    fields: {
      transaction,
      message: successMsg,
    },
  });
  
  return Response.json(payload, {
    headers: ACTIONS_CORS_HEADERS,
  });

    // create an instruction to transfer native SOL from one wallet to another
    // const transferSolInstruction = SystemProgram.transfer({
    //   fromPubkey: account,
    //   toPubkey: toPubkey,
    //   lamports: amount * LAMPORTS_PER_SOL,
    // });
    // instructions.push(transferSolInstruction)
  } else {
    const decimals = splPubkeyMap[token][1]; // In the example, we use 6 decimals for USDC, but you can use any SPL token
    const mintAddress = new PublicKey(`${splPubkeyMap[token][0]}`); // replace this with any SPL token mint address

    // converting value to fractional units

    let transferAmount: any = parseFloat(amount.toString());
    transferAmount = transferAmount.toFixed(decimals);
    transferAmount = transferAmount * Math.pow(10, decimals);

    const fromTokenAccount = await splToken.getAssociatedTokenAddress(
      mintAddress,
      account,
      false,
      splToken.TOKEN_PROGRAM_ID,
      splToken.ASSOCIATED_TOKEN_PROGRAM_ID,
    );

    let toTokenAccount = await splToken.getAssociatedTokenAddress(
      mintAddress,
      toPubkey,
      true,
      splToken.TOKEN_PROGRAM_ID,
      splToken.ASSOCIATED_TOKEN_PROGRAM_ID,
    );

    const ifexists = await connection.getAccountInfo(toTokenAccount);

    if (!ifexists || !ifexists.data) {
      let createATAiX = splToken.createAssociatedTokenAccountInstruction(
        account,
        toTokenAccount,
        toPubkey,
        mintAddress,
        splToken.TOKEN_PROGRAM_ID,
        splToken.ASSOCIATED_TOKEN_PROGRAM_ID,
      );
      instructions.push(createATAiX);
    }

    let transferInstruction = splToken.createTransferInstruction(
      fromTokenAccount,
      toTokenAccount,
      account,
      transferAmount,
    );
    instructions.push(transferInstruction);
  }

  // get the latest blockhash amd block height
  const { blockhash, lastValidBlockHeight } =
    await connection.getLatestBlockhash();

    console.log("add to t")
    console.log(instructions)
  // create a legacy transaction
  const transaction = VersionedTransaction.deserialize(new Uint8Array(instructions[0]))
  // const transaction = new Transaction({
  //   feePayer: account,
  //   blockhash,
  //   lastValidBlockHeight,
  // }).add(...instructions);
      
  const payload: ActionPostResponse = await createPostResponse({
    fields: {
      transaction,
      message: successMsg,
    },
  });
  
  return Response.json(payload, {
    headers: ACTIONS_CORS_HEADERS,
  });
};

function validatedQueryParams(requestUrl: URL) {
  let toPubkey: PublicKey = new PublicKey(
    pubkeyToDonateTo,
  );
  let amount: number = 0.1;
  let token: string = "SOL"

  try {
    if (requestUrl.searchParams.get('to')) {
      toPubkey = new PublicKey(requestUrl.searchParams.get('to')!);
    }
  } catch (err) {
    throw 'Invalid input query parameter: to';
  }

  try {
    if (requestUrl.searchParams.get('amount')) {
      amount = parseFloat(requestUrl.searchParams.get('amount')!);
    }

    if (amount <= 0) throw 'amount is too small';
  } catch (err) {
    throw 'Invalid input query parameter: amount';
  }

  try {
    if (requestUrl.searchParams.get('token')) {
      token = requestUrl.searchParams.get('token')!;
    }

    //if (pubkeyMap[token] == null) throw 'not valid token';
  } catch (err) {
    throw 'Invalid input query parameter: token';
  }

  return {
    token,
    amount,
    toPubkey,
  };
}