"use client";
 
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";

import {
  Blink, 
  Action,
  MiniBlink,
  useAction,
  useActionsRegistryInterval,
} from '@dialectlabs/blinks';
import { useActionSolanaWalletAdapter } from '@dialectlabs/blinks/hooks/solana';
import '@dialectlabs/blinks/index.css';
import '@solana/wallet-adapter-react-ui/styles.css';
 
export default function Home() {
  useActionsRegistryInterval();

  const { adapter } = useActionSolanaWalletAdapter(
    "https://api.mainnet-beta.solana.com",
  );

  // const [action, setAction] = useState<Action | null>(null);
  const actionApiUrl = 'solana-action:http://localhost:3000/api/swap';
  const { action, isLoading } = useAction({url: actionApiUrl, adapter});    

  return (
    <main className="flex items-center justify-center min-h-screen max-w-[400px]">
      <div className="border hover:border-slate-900 rounded">
        <WalletMultiButton style={{}} />
        <div className="flex min-w-[400px] flex-col items-center">
          <h1 className="mb-4 text-center text-4xl font-bold">Mini Blinks</h1>
          <div className="mb-4">
            {isLoading || !action ? (
              <span>Loading</span>
            ) : (
              <MiniBlink
                selector={(currentAction) =>
                  currentAction.actions.find((a) => a.label === 'Donate')!
                }
                action={action}
              />
              // <Blink action={action} websiteText={new URL(actionApiUrl).hostname} />
            )}
          </div>
        </div>
      </div>
    </main>
  );
}