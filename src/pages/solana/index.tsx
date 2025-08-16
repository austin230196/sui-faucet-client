import { useState, useEffect, useMemo } from 'react';
import { Copy, Check, AlertCircle, Droplets, Wallet, Clock, Shield, Zap, ExternalLink, RefreshCw, Network as NetworkIcon, Sun, Moon } from 'lucide-react';
import { useSolanaAirdropMutation } from '../../api/mutations';
import { useSolanaGetAirdropRequests, useSolanaGetAnalytics } from '../../api/queries';
import { Network } from '../../enum/network.enum';
import { RequestStatus } from '../../enum/request-status.enum';
import type AirdropRequest from '../../types/request.type';
import { normalizeDate } from '../../utils/normalize-date';





type INetwork = {
    id: Network;
    name: string;
    description: string;
    color: string;
    icon: string;
    rpcUrl: string;
}

const networks: INetwork[] = [
    { 
      id: Network.Devnet, 
      name: 'Devnet', 
      description: 'Development network for testing',
      color: 'from-purple-500 to-pink-500',
      icon: 'moon',
      rpcUrl: 'https://api.devnet.solana.com'
    },
    { 
      id: Network.Testnet, 
      name: 'Testnet', 
      description: 'Stable testing environment',
      color: 'from-blue-500 to-emerald-500',
      icon: 'sun',
      rpcUrl: 'https://api.testnet.solana.com'
    }
];


const SolanaFaucetDApp = () => {
  const [walletAddress, setWalletAddress] = useState('');
  const [selectedNetwork, setSelectedNetwork] = useState<INetwork>(networks[0]);
  const [selectedAmount, setSelectedAmount] = useState('1');
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [copiedItems, setCopiedItems] = useState({}); // Fixed: individual copy states
  const [remainingTime, setRemainingTime] = useState(0);
  const [recentRequests, setRecentRequests] = useState<AirdropRequest[]>([]);
  const [stats, setStats] = useState<{totalRequests: number, totalSolDistributed: number, activeUsers: number}>({
    totalRequests: 0,
    totalSolDistributed: 0,
    activeUsers: 0
  });
  const airdropRequests = useSolanaGetAirdropRequests(selectedNetwork.id)
  const analytics = useSolanaGetAnalytics(selectedNetwork.id)
  const airdropMutation = useSolanaAirdropMutation();

  useMemo(() => {
    if(airdropRequests.isLoading) return;
    if(airdropRequests.isError) {
        setError(airdropRequests.error.message)
        return;
    };
    if(airdropRequests.data) {
      console.log("[*] Airdrop requests", JSON.stringify(airdropRequests, null, 2))
      setRecentRequests(airdropRequests.data.data)
    }
  }, [airdropRequests.isLoading, isLoading, selectedNetwork])

  useMemo(() => {
    if(analytics.isLoading) return;
    if(analytics.isError) {
        setError(analytics.error.message)
        return;
    };
    if(analytics.data) {
      console.log("[*] Analytics", JSON.stringify(analytics, null, 2))
      setStats(analytics.data.data)
    }
  }, [analytics.isLoading, isLoading, selectedNetwork])



  const amounts = [
    { value: '0.5', label: '0.5 SOL', description: 'Basic testing' },
    { value: '1', label: '1.0 SOL', description: 'Standard amount' },
    { value: '2', label: '2.0 SOL', description: 'Heavy testing' },
    { value: '5', label: '5.0 SOL', description: 'Development work' }
  ];

  // Validate Solana wallet address
  const isValidSolanaAddress = (address: string) => {
    // Solana addresses are base58 encoded, typically 32-44 characters
    return /^[1-9A-HJ-NP-Za-km-z]{32,44}$/.test(address);
  };

  // Timer countdown for rate limiting
  useEffect(() => {
    let interval: any = null;
    if (remainingTime > 0) {
      interval = setInterval(() => {
        setRemainingTime((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [remainingTime]);

  // Format time
  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    if (hours > 0) {
      return `${hours}h ${minutes}m ${secs}s`;
    } else if (minutes > 0) {
      return `${minutes}m ${secs}s`;
    } else {
      return `${secs}s`;
    }
  };

  useEffect(() => {
    console.log("[*] Selected network", selectedNetwork);
  }, [selectedNetwork])

  const handleSubmit = async () => {
    setError('');
    setSuccess(false);

    if (!walletAddress) {
      setError('Please enter a wallet address');
      return;
    }

    if (!isValidSolanaAddress(walletAddress)) {
      setError('Please enter a valid Solana wallet address');
      return;
    }

    if (remainingTime > 0) {
      setError(`Please wait ${formatTime(remainingTime)} before requesting again`);
      return;
    }

    setIsLoading(true);

    // Simulate API call
    try {
      const res = await airdropMutation.mutateAsync({
        address: walletAddress,
        amount: parseFloat(selectedAmount),
        network: selectedNetwork.id
      })
      console.log("[*] Airdrop response", JSON.stringify(res, null, 2))
      if(res.status !== RequestStatus.SUCCESS) throw new Error(res.message);
    //   setTxHash(res.data.txHash);
      setSuccess(true);
      setRemainingTime(1800); // 30 minutes cooldown
      airdropRequests.refetch();
      analytics.refetch();
      setWalletAddress(() => "")

    } catch (err) {
      setError('Failed to request tokens. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedItems(prev => ({ ...prev, [id]: true }));
    setTimeout(() => {
      setCopiedItems(prev => ({ ...prev, [id]: false }));
    }, 2000);
  };

  const connectWallet = () => {
    // Mock wallet connection - generate a random Solana address
    const chars = '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz';
    let result = '';
    for (let i = 0; i < 44; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setWalletAddress(result);
  };

  const currentNetwork = networks.find(n => n.id === selectedNetwork.id);
//   const currentStats = stats[selectedNetwork];

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900">
      {/* Background Pattern */}
      {/* <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg width=\"60\" height=\"60\" viewBox=\"0 0 60 60\" xmlns=\"http://www.w3.org/2000/svg\"%3E%3Cg fill=\"none\" fill-rule=\"evenodd\"%3E%3Cg fill=\"%239333ea\" fill-opacity=\"0.05\"%3E%3Ccircle cx=\"30\" cy=\"30\" r=\"2\"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')]"></div> */}
      
      {/* Header */}
      <header className="relative z-10 border-b border-purple-800/50 bg-gray-900/80 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 ${selectedNetwork.color} bg-gradient-to-r rounded-xl flex items-center justify-center shadow-lg shadow-purple-500/25`}>
                <Droplets className="w-6 h-6 text-white" />
              </div>
              <div className='sm:flex flex-col hidden'>
                <h1 className="text-xl font-bold text-white">Solana Faucet</h1>
                <p className="text-xs text-gray-400">Testnet & Devnet Tokens</p>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <a
                href="https://docs.solana.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-white transition-colors flex items-center gap-2"
              >
                Docs
                <ExternalLink size={16} />
              </a>
              <div className="w-px h-6 bg-gray-700"></div>
              <div className="flex items-center gap-2 text-sm">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                <span className="text-gray-300">Active</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Faucet Card */}
          <div className="lg:col-span-2">
            <div className="bg-gray-800/50 backdrop-blur-xl rounded-2xl border border-gray-700/50 p-8 shadow-2xl">
              {/* Hero Section */}
              <div className="text-center mb-8">
                <div className={`w-20 h-20 bg-gradient-to-r ${currentNetwork?.color} rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg`}>
                  <Droplets className="w-10 h-10 text-white" />
                </div>
                <h2 className="text-3xl font-bold text-white mb-2">Get SOL Tokens</h2>
                <p className="text-gray-400 text-lg">
                  Request free tokens for development and testing on Solana networks
                </p>
              </div>

              {/* Network Selection */}
              <div className="mb-10">
                <label className="block text-sm font-semibold text-gray-300 mb-3">
                  Select Network
                </label>
                <div className="grid sm:grid-cols-2 grid-cols-1 gap-4">
                  {networks.map((network) => (
                    <button
                      key={network.id}
                      onClick={() => setSelectedNetwork(network)}
                      className={`p-4 hover:cursor-pointer rounded-xl border-2 transition-all duration-200 text-left ${
                        selectedNetwork.id === network.id
                          ? `border-gray-500 bg-gradient-to-r ${network.color} bg-opacity-10`
                          : 'border-gray-600 bg-gray-800/30 hover:border-gray-500'
                      }`}
                    >
                      <div className="flex items-center gap-3 mb-2">
                        {network.icon === 'moon' ? 
                          <Moon size={20} className="text-white" /> : 
                          <Sun size={20} className="text-white" />
                        }
                        <span className="font-semibold text-white">{network.name}</span>
                      </div>
                      <p className="text-sm text-gray-400">{network.description}</p>
                      <p className="text-xs text-gray-500 mt-1 font-mono">{network.rpcUrl}</p>
                    </button>
                  ))}
                </div>
              </div>

              {/* Amount Selection */}
              <div className="mb-10">
                <label className="block text-sm font-semibold text-gray-300 mb-3">
                  Select Amount
                </label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {amounts.map((amount) => (
                    <button
                      key={amount.value}
                      onClick={() => setSelectedAmount(amount.value)}
                      className={`p-3 hover:cursor-pointer rounded-lg border transition-all duration-200 text-center ${
                        selectedAmount === amount.value
                          ? 'border-purple-500 bg-purple-500/10 text-white'
                          : 'border-gray-600 bg-gray-800/30 text-gray-300 hover:border-gray-500'
                      }`}
                    >
                      <div className="font-semibold">{amount.label}</div>
                      <div className="text-xs text-gray-400">{amount.description}</div>
                    </button>
                  ))}
                {/* <button
                    key={"custom"}
                    onClick={() => setSelectedAmount("custom")}
                    className={`p-3 hover:cursor-pointer rounded-lg border transition-all duration-200 text-center ${
                    selectedAmount === "custom"
                        ? 'border-purple-500 bg-purple-500/10 text-white'
                        : 'border-gray-600 bg-gray-800/30 text-gray-300 hover:border-gray-500'
                    }`}
                >
                    <div className="font-semibold">{amount.label}</div>
                    <div className="text-xs text-gray-400">{amount.description}</div>
                </button> */}
                </div>
              </div>

              {/* Wallet Address Input */}
              <div className="mb-10">
                <label className="block text-sm font-semibold text-gray-300 mb-3">
                  Wallet Address
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={walletAddress}
                    onChange={(e) => setWalletAddress(e.target.value)}
                    placeholder="7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU"
                    className="w-full px-4 py-4 bg-gray-900/50 border border-gray-600 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 pr-12 font-mono"
                  />
                  <button
                    onClick={connectWallet}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 p-2 text-gray-400 hover:text-white transition-colors rounded-lg hover:bg-gray-700/50"
                    title="Connect Wallet"
                  >
                    <Wallet size={20} />
                  </button>
                </div>
                {walletAddress && !isValidSolanaAddress(walletAddress) && (
                  <p className="mt-2 text-sm text-red-400 flex items-center gap-2">
                    <AlertCircle size={16} />
                    Invalid Solana address format
                  </p>
                )}
              </div>

              {/* Request Summary */}
              <div className="bg-gray-900/50 rounded-xl p-4 border border-gray-600/50 mb-10">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 bg-gradient-to-r ${currentNetwork?.color} rounded-lg flex items-center justify-center`}>
                      {currentNetwork?.icon === 'moon' ? 
                        <Moon size={16} className="text-white" /> : 
                        <Sun size={16} className="text-white" />
                      }
                    </div>
                    <div>
                      <span className="text-gray-400">Request on {currentNetwork?.name}:</span>
                      <div className="text-2xl font-bold text-white">{selectedAmount} SOL</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <button
                onClick={handleSubmit}
                disabled={isLoading || remainingTime > 0 || !isValidSolanaAddress(walletAddress)}
                className={`cursor-pointer w-full py-4 px-6 rounded-xl font-semibold text-white transition-all duration-200 flex items-center justify-center gap-3 ${
                  isLoading || remainingTime > 0 || !isValidSolanaAddress(walletAddress)
                    ? 'bg-gray-600 cursor-not-allowed'
                    : `bg-gradient-to-r ${currentNetwork?.color} hover:scale-[1.02] shadow-lg hover:shadow-purple-500/40`
                }`}
              >
                {isLoading ? (
                  <>
                    <RefreshCw className="w-5 h-5 animate-spin" />
                    Requesting Tokens...
                  </>
                ) : remainingTime > 0 ? (
                  <>
                    <Clock className="w-5 h-5" />
                    Wait {formatTime(remainingTime)}
                  </>
                ) : (
                  <>
                    <Zap className="w-5 h-5" />
                    Request {selectedAmount} SOL on {currentNetwork?.name}
                  </>
                )}
              </button>

              {/* Messages */}
              {error && (
                <div className="mt-4 bg-red-900/20 border border-red-500/30 rounded-xl p-4 flex items-center gap-3">
                  <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
                  <span className="text-red-200">{error}</span>
                </div>
              )}

              {success && (
                <div className="mt-4 bg-green-900/20 border border-green-500/30 rounded-xl p-4 flex items-center gap-3">
                  <Check className="w-5 h-5 text-green-400 flex-shrink-0" />
                  <div className="flex-1">
                    <span className="text-green-200">
                      Successfully sent {selectedAmount} SOL to your wallet on {currentNetwork?.name}!
                    </span>
                    <p className="text-sm text-green-300/70 mt-1 font-mono">
                      Transaction: {""}
                    </p>
                    <button
                      onClick={() => copyToClipboard("", 'tx-hash')}
                      className="text-xs text-green-400 hover:text-green-300 mt-1 flex items-center gap-1"
                    >
                      {copiedItems as any['tx-hash'] ? <Check size={12} /> : <Copy size={12} />}
                      Copy transaction hash
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Info Cards */}
            <div className="grid md:grid-cols-3 gap-4 mt-8">
              <div className="bg-gray-800/30 backdrop-blur-xl rounded-xl border border-gray-700/50 p-6 text-center">
                <Shield className="w-8 h-8 text-purple-400 mx-auto mb-3" />
                <h3 className="font-semibold text-white mb-2">Rate Limited</h3>
                <p className="text-sm text-gray-400">1 request per 30 minutes</p>
              </div>
              <div className="bg-gray-800/30 backdrop-blur-xl rounded-xl border border-gray-700/50 p-6 text-center">
                <NetworkIcon className="w-8 h-8 text-green-400 mx-auto mb-3" />
                <h3 className="font-semibold text-white mb-2">Multi-Network</h3>
                <p className="text-sm text-gray-400">Devnet & Testnet support</p>
              </div>
              <div className="bg-gray-800/30 backdrop-blur-xl rounded-xl border border-gray-700/50 p-6 text-center">
                <Zap className="w-8 h-8 text-yellow-400 mx-auto mb-3" />
                <h3 className="font-semibold text-white mb-2">Flexible Amounts</h3>
                <p className="text-sm text-gray-400">0.5 to 5.0 SOL per request</p>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-8">
            {/* Current Network Stats */}
            <div className="bg-gray-800/50 backdrop-blur-xl rounded-2xl border border-gray-700/50 p-6">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <div className={`w-5 h-5 bg-gradient-to-r ${currentNetwork?.color} rounded-full flex items-center justify-center`}>
                  {currentNetwork?.icon === 'moon' ? 
                    <Moon size={12} className="text-white" /> : 
                    <Sun size={12} className="text-white" />
                  }
                </div>
                {currentNetwork?.name} Stats
              </h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Total Requests</span>
                  <span className="font-semibold text-white">{stats?.totalRequests?.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">SOL Distributed</span>
                  <span className="font-semibold text-white">{stats?.totalSolDistributed?.toLocaleString()} SOL</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Active Users</span>
                  <span className="font-semibold text-white">{stats?.activeUsers?.toLocaleString()}</span>
                </div>
              </div>
            </div>

            {/* Network Comparison */}
            <div className="bg-gray-800/50 backdrop-blur-xl rounded-2xl border border-gray-700/50 p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Network Comparison</h3>
              <div className="space-y-4">
                {networks.map((network) => {
                  const networkStats = (stats as any)[network.id];
                  return (
                    <div key={network.id} className="flex items-center justify-between p-3 bg-gray-900/30 rounded-lg border border-gray-700/30">
                      <div className="flex items-center gap-3">
                        <div className={`w-6 h-6 bg-gradient-to-r ${network.color} rounded-lg flex items-center justify-center`}>
                          {network.icon === 'moon' ? 
                            <Moon size={12} className="text-white" /> : 
                            <Sun size={12} className="text-white" />
                          }
                        </div>
                        <span className="text-white font-medium">{network.name}</span>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-semibold text-white">{networkStats?.totalSolDistributed?.toFixed(1)} SOL</div>
                        <div className="text-xs text-gray-400">{networkStats?.totalRequests} requests</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-gray-800/50 backdrop-blur-xl rounded-2xl border border-gray-700/50 p-6">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <Clock className="w-5 h-5 text-green-400" />
                Recent Activity
              </h3>
              <div className="space-y-3">
                {recentRequests?.length > 0 ? recentRequests?.map((tx) => {
                  const network = networks.find(n => n.id === tx.network);
                  const copyId = `addr-${tx.id || tx.address}`;
                  return (
                    <div key={tx.id || tx.address} className="flex items-center justify-between p-3 bg-gray-900/30 rounded-lg border border-gray-700/30">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-sm text-gray-300">
                            {tx.address.substring(0, 8)}...{tx.address.substring(tx.address?.length - 6)}
                          </span>
                          <button
                            onClick={() => copyToClipboard(tx.address, copyId)}
                            className="text-gray-500 hover:text-white transition-colors"
                            title="Copy address"
                          >
                            {(copiedItems as any)[copyId] ? <Check size={14} /> : <Copy size={14} />}
                          </button>
                        </div>
                        <div className="flex flex-col gap-1">
                            <div className="flex items-center gap-2 mt-1">
                                <span className="text-xs text-gray-400">{normalizeDate(tx.createdAt)}</span>
                                <span className="w-1 h-1 bg-gray-500 rounded-full"></span>
                                <span className="text-xs text-green-400">{tx.amount} SOL</span>
                                <span className="w-1 h-1 bg-gray-500 rounded-full"></span>
                            </div>
                            <div className="flex items-center gap-2 mt-1">
                                <div className={`w-3 h-3 bg-gradient-to-r ${network?.color} rounded-full`}></div>
                                <span className="text-xs text-gray-400">{network?.name}</span>
                            </div>
                        </div>
                      </div>
                      {/* <div className="w-2 h-2 bg-green-400 rounded-full"></div> */}
                    </div>
                  );
                }) : <div className="text-gray-400">No recent activity</div> }
              </div>
            </div>

            {/* Help */}
            <div className="bg-gray-800/50 backdrop-blur-xl rounded-2xl border border-gray-700/50 p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Need Help?</h3>
              <div className="space-y-3">
                <a
                  href="https://docs.solana.com/wallet-guide"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block text-sm text-gray-400 hover:text-purple-400 transition-colors"
                >
                  How to create a Solana wallet →
                </a>
                <a
                  href="https://docs.solana.com/clusters"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block text-sm text-gray-400 hover:text-purple-400 transition-colors"
                >
                  Network documentation →
                </a>
                <a
                  href="https://github.com/solana-labs/solana/issues"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block text-sm text-gray-400 hover:text-purple-400 transition-colors"
                >
                  Report issues →
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SolanaFaucetDApp;