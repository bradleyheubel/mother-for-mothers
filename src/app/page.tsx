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
import './globals.css'
 
export default function Home() {
  useActionsRegistryInterval();

  const { adapter } = useActionSolanaWalletAdapter(
    "https://api.mainnet-beta.solana.com",
  );

  // const [action, setAction] = useState<Action | null>(null);
  const actionApiUrl = 'solana-action:http://localhost:3000/api/swap';
  const { action, isLoading } = useAction({url: actionApiUrl, adapter});    

  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24 bg-repeat" style={{ backgroundImage: 'url("/mother.jpeg")' }}>
  {/* Scrolling background */}
  <div 
    className="absolute inset-0 z-0"
    style={{
      backgroundImage: 'url("/mother.jpeg")',
      backgroundSize: '240px 240px',
      backgroundRepeat: 'repeat',
      animation: 'scrollBackground 20s linear infinite',
    }}
  ></div>

  {/* Overlay to ensure text readability */}
  <div className="absolute inset-0 bg-gray-600 opacity-60 z-10"></div>
  
      <div className="relative z-10 flex flex-col items-center justify-center w-full">
        <div className="max-w-md w-full bg-white shadow-lg rounded-lg overflow-hidden">
          <div className="bg-pink-600 text-white py-4 px-6">
            <h1 className="text-3xl font-bold text-center">MOTHER for Mothers</h1>
            <p className="text-center mt-2 text-pink-100">MOTHER provides...</p>
          </div>
          <div className="p-6">
            <p className="text-gray-600 mb-6 text-center">
              This campaign raises funds for: Mum for Mum <br/>
              <a className="text-blue-600" target="_blank" href="https://www.mumformum.org.au/">https://www.mumformum.org.au/</a>
            </p>
            <div className="mb-6" suppressHydrationWarning>
              <WalletMultiButton className="w-full bg-pink-500 hover:bg-pink-600 text-white font-bold py-2 px-4 rounded transition duration-300" />
            </div>
            <div className="mb-6" >
              {isLoading || !action ? (
                <div className="text-center text-gray-500">
                  <svg className="animate-spin h-8 w-8 mx-auto mb-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Loading...
                </div>
              ) : (
                <MiniBlink
                  selector={(currentAction) =>
                    currentAction.actions.find((a) => a.label === 'Donate')!
                  }
                  action={action}
                />
              )}
            </div>
          </div>
          <div className="bg-gray-100 px-6 py-4">
            <p className="text-sm text-gray-600 text-center flex items-center justify-center">
              <span className="inline-flex items-center ml-1">
                <img src="https://framerusercontent.com/images/FdRLSSAhLGZiK3OQMWOwwD6LM.png" alt="Solana ANZ logo" className="w-4 h-4 mr-1" />
                <a target="_blank" href="https://solanaanz.org/">Solana ANZ</a>
              </span>
            </p>
          </div>
        </div>
      </div>
      <style jsx>{`
  @keyframes scrollBackground {
    from { background-position: 0 0; }
    to { background-position: 0 100%; }
  }
`}</style>
    </main>
    
  );
}