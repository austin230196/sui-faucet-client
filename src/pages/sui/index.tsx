import { useState, useEffect, useMemo } from 'react';
import { Copy, Check, AlertCircle, Droplets, Wallet, Clock, Shield, Zap, ExternalLink, RefreshCw } from 'lucide-react';
import { useSuiAirdropMutation } from '../../api/mutations';
import { RequestStatus } from '../../enum/request-status.enum';
import { useSuiGetAirdropRequests, useSuiGetAnalytics } from '../../api/queries';
import type AirdropRequest from '../../types/request.type';
import { normalizeDate } from '../../utils/normalize-date';





const SuiFaucetDApp = () => {
  const [walletAddress, setWalletAddress] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);
  const [remainingTime, setRemainingTime] = useState(0);
  const [recentRequests, setRecentRequests] = useState<AirdropRequest[]>([]);
  const [stats, setStats] = useState<{totalRequests: number, totalSuiDistributed: number, activeUsers: number}>({
    totalRequests: 0,
    totalSuiDistributed: 0,
    activeUsers: 0
  });
  const airdropRequests = useSuiGetAirdropRequests();
  const analytics = useSuiGetAnalytics();
  const airdropMutation = useSuiAirdropMutation();

  console.log("[*] Airdrop requests", JSON.stringify(airdropRequests.data, null, 2));
  console.log("[*] Analytics", JSON.stringify(analytics.data, null, 2));

  useMemo(() => {
    if(airdropRequests.isLoading) return;
    if(airdropRequests.isError) return;
    if(airdropRequests.data){
      if(airdropRequests.data.status === RequestStatus.ERROR) setError(airdropRequests.data.message);
      setRecentRequests(airdropRequests.data.data);
    }
  }, [airdropRequests.isLoading, isLoading])


  useMemo(() => {
    if(analytics.isLoading) return;
    if(analytics.isError) return;
    if(analytics.data){
      if(analytics.data.status === RequestStatus.ERROR) setError(analytics.data.message);
      setStats(analytics.data.data);
    }
  }, [analytics.isLoading, isLoading])


  // Validate Sui wallet address
  const isValidSuiAddress = (address: string) => {
    return /^0x[a-fA-F0-9]{64}$/.test(address);
  };

  // Timer countdown for rate limiting
  useEffect(() => {
    let interval: any = null;
    if (remainingTime > 0) {
      interval = setInterval(() => {
        setRemainingTime((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval!);
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

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    setError('');
    setSuccess(false);

    if (!walletAddress) {
      setError('Please enter a wallet address');
      return;
    }

    if (!isValidSuiAddress(walletAddress)) {
      setError('Please enter a valid Sui wallet address (0x followed by 64 hex characters)');
      return;
    }

    if (remainingTime > 0) {
      setError(`Please wait ${formatTime(remainingTime)} before requesting again`);
      return;
    }

    setIsLoading(true);

    try {
      const res = await airdropMutation.mutateAsync({
        address: walletAddress,
        amount: 10.0
      })
      console.log("[*] Airdrop request sent successfully", JSON.stringify(res, null, 2));
      if(res.status === RequestStatus.ERROR) throw new Error(res.message);
      
      // Mock success response
      setSuccess(true);
      setRemainingTime(10);
      await airdropRequests.refetch();
      await analytics.refetch();

    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const connectWallet = () => {
    // Mock wallet connection
    setWalletAddress('0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-slate-900 to-blue-900">
      {/* Background Pattern */}
      {/* <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="none" fill-rule="evenodd"%3E%3Cg fill="%234f46e5" fill-opacity="0.05"%3E%3Ccircle cx="30" cy="30" r="2"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')]"></div> */}
      
      {/* Header */}
      <header className="relative z-10 border-b border-slate-800/50 bg-slate-900/80 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center">
                <Droplets className="w-6 h-6 text-white" />
              </div>
              <div className="sm:flex flex-col hidden">
                <h1 className="text-xl font-bold text-white">Sui Testnet Faucet</h1>
                <p className="text-xs text-slate-400">Get free testnet tokens</p>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <a
                href="https://docs.sui.io"
                target="_blank"
                rel="noopener noreferrer"
                className="text-slate-400 hover:text-white transition-colors flex items-center gap-2"
              >
                Docs
                <ExternalLink size={16} />
              </a>
              <div className="w-px h-6 bg-slate-700"></div>
              <div className="flex items-center gap-2 text-sm">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                <span className="text-slate-300">Testnet Active</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Faucet Card */}
          <div className="lg:col-span-2">
            <div className="bg-slate-800/50 backdrop-blur-xl rounded-2xl border border-slate-700/50 p-8 shadow-2xl">
              {/* Hero Section */}
              <div className="text-center mb-8">
                <div className="w-20 h-20 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-blue-500/25">
                  <Droplets className="w-10 h-10 text-white" />
                </div>
                <h2 className="text-3xl font-bold text-white mb-2">Get SUI Testnet Tokens</h2>
                <p className="text-slate-400 text-lg">
                  Request free testnet tokens for development and testing on Sui Network
                </p>
              </div>

              {/* Form */}
              <form className="space-y-6">
                <div>
                  <label className="block text-sm font-semibold text-slate-300 mb-3">
                    Wallet Address
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={walletAddress}
                      onChange={(e) => setWalletAddress(e.target.value)}
                      placeholder="0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef"
                      className="w-full px-4 py-4 bg-slate-900/50 border border-slate-600 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 pr-12"
                    />
                    <button
                      type="button"
                      onClick={connectWallet}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 p-2 text-slate-400 hover:text-white transition-colors rounded-lg hover:bg-slate-700/50"
                      title="Connect Wallet"
                    >
                      <Wallet size={20} />
                    </button>
                  </div>
                  {walletAddress && !isValidSuiAddress(walletAddress) && (
                    <p className="mt-2 text-sm text-red-400 flex items-center gap-2">
                      <AlertCircle size={16} />
                      Invalid Sui address format
                    </p>
                  )}
                </div>

                {/* Amount Display */}
                <div className="bg-slate-900/50 rounded-xl p-4 border border-slate-600/50">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Amount to receive:</span>
                    <span className="text-2xl font-bold text-white">10.0 SUI</span>
                  </div>
                </div>

                {/* Submit Button */}
                <button
                  onClick={handleSubmit}
                  disabled={isLoading || remainingTime > 0 || !isValidSuiAddress(walletAddress)}
                  className={`cursor-pointer w-full py-4 px-6 rounded-xl font-semibold text-white transition-all duration-200 flex items-center justify-center gap-3 ${
                    isLoading || remainingTime > 0 || !isValidSuiAddress(walletAddress)
                      ? 'bg-slate-600 cursor-not-allowed'
                      : 'bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 hover:scale-[1.02]'
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
                      Request Testnet Tokens
                    </>
                  )}
                </button>

                {/* Messages */}
                {error && (
                  <div className="bg-red-900/20 border border-red-500/30 rounded-xl p-4 flex items-center gap-3">
                    <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
                    <span className="text-red-200">{error}</span>
                  </div>
                )}

                {success && (
                  <div className="bg-green-900/20 border border-green-500/30 rounded-xl p-4 flex items-center gap-3">
                    <Check className="w-5 h-5 text-green-400 flex-shrink-0" />
                    <div className="flex-1">
                      <span className="text-green-200">
                        Successfully sent 10.0 SUI to your wallet!
                      </span>
                      <p className="text-sm text-green-300/70 mt-1">
                        Tokens should appear in your wallet within a few minutes.
                      </p>
                    </div>
                  </div>
                )}
              </form>
            </div>

            {/* Info Cards */}
            <div className="grid md:grid-cols-3 gap-4 mt-8">
              <div className="bg-slate-800/30 backdrop-blur-xl rounded-xl border border-slate-700/50 p-6 text-center">
                <Shield className="w-8 h-8 text-blue-400 mx-auto mb-3" />
                <h3 className="font-semibold text-white mb-2">Rate Limited</h3>
                <p className="text-sm text-slate-400">1 request per 20 minutes per address</p>
              </div>
              <div className="bg-slate-800/30 backdrop-blur-xl rounded-xl border border-slate-700/50 p-6 text-center">
                <Droplets className="w-8 h-8 text-cyan-400 mx-auto mb-3" />
                <h3 className="font-semibold text-white mb-2">Fixed Amount</h3>
                <p className="text-sm text-slate-400">10.0 SUI per request</p>
              </div>
              <div className="bg-slate-800/30 backdrop-blur-xl rounded-xl border border-slate-700/50 p-6 text-center">
                <Zap className="w-8 h-8 text-yellow-400 mx-auto mb-3" />
                <h3 className="font-semibold text-white mb-2">Instant</h3>
                <p className="text-sm text-slate-400">Tokens sent immediately</p>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-8">
            {/* Stats */}
            <div className="bg-slate-800/50 backdrop-blur-xl rounded-2xl border border-slate-700/50 p-6">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <Droplets className="w-5 h-5 text-blue-400" />
                Faucet Stats
              </h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-slate-400">Total Requests</span>
                  <span className="font-semibold text-white">{stats?.totalRequests?.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-400">SUI Distributed</span>
                  <span className="font-semibold text-white">{stats?.totalSuiDistributed?.toLocaleString()} SUI</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-400">Active Users</span>
                  <span className="font-semibold text-white">{stats?.activeUsers?.toLocaleString()}</span>
                </div>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-slate-800/50 backdrop-blur-xl rounded-2xl border border-slate-700/50 p-6">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <Clock className="w-5 h-5 text-green-400" />
                Recent Activity
              </h3>
              <div className="space-y-3">
                {
                  recentRequests.length > 0 ? recentRequests.map((tx, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-slate-900/30 rounded-lg border border-slate-700/30">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-sm text-slate-300">
                            {tx.address.substring(0, 8)}...{tx.address.substring(tx.address.length - 6)}
                          </span>
                          <button
                            onClick={() => copyToClipboard(tx.address)}
                            className="text-slate-500 hover:cursor-pointer hover:text-white transition-colors"
                          >
                            {copied ? <Check size={14} /> : <Copy size={14} />}
                          </button>
                        </div>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-xs text-slate-400">{normalizeDate(tx.createdAt)}</span>
                          <span className="w-1 h-1 bg-slate-500 rounded-full"></span>
                          <span className="text-xs text-green-400">{tx.amount} SUI</span>
                        </div>
                      </div>
                      <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                    </div>
                  )) : (
                    <div className="flex items-center justify-center p-3 bg-slate-900/30 rounded-lg border border-slate-700/30">
                      <span className="text-sm text-slate-400">No recent activity</span>
                    </div>
                  )
                }
              </div>
            </div>

            {/* Help */}
            <div className="bg-slate-800/50 backdrop-blur-xl rounded-2xl border border-slate-700/50 p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Need Help?</h3>
              <div className="space-y-3">
                <a
                  href="#"
                  className="block text-sm text-slate-400 hover:text-blue-400 transition-colors"
                >
                  How to create a Sui wallet →
                </a>
                <a
                  href="#"
                  className="block text-sm text-slate-400 hover:text-blue-400 transition-colors"
                >
                  Testnet documentation →
                </a>
                <a
                  href="#"
                  className="block text-sm text-slate-400 hover:text-blue-400 transition-colors"
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

export default SuiFaucetDApp;