import { axiosInstance } from "../axios";
import type { Chain } from "../enum/chain.enum";
import type { Network } from "../enum/network.enum";


export const requestAirdrop = async (address: string, amount: number) => {
    try{
        let response = await axiosInstance.post(`/v1/sui/airdrop`, {
            address,
            amount
        });

        console.log("[*] Airdrop request sent successfully");
        return response.data;
    }catch(e: any){
        throw new Error(e.message);
    }
}

export const requestSolanaAirdrop = async (network: Network, address: string, amount: number) => {
    try{
        let urlParams = new URLSearchParams();
        urlParams.append("network", network);
        let response = await axiosInstance.post(`/v1/solana/airdrop?${urlParams}`, {
            address,
            amount
        });

        console.log("[*] Airdrop request sent successfully");
        return response.data;
    }catch(e: any){
        throw new Error(e.message);
    }
}


export const getAirdropRequests = async (chain: Chain, network: Network) => {
    try{
        let urlParams = new URLSearchParams();
        urlParams.append("chain", chain);
        urlParams.append("network", network);
        let response = await axiosInstance.get(`/v1/recent-requests?${urlParams}`);
        return response.data;
    }catch(e: any){
        throw new Error(e.message);
    }
}


export const getAnalytics = async (chain: Chain, network: Network) => {
    try{
        let urlParams = new URLSearchParams();
        urlParams.append("chain", chain);
        urlParams.append("network", network);
        let response = await axiosInstance.get(`/v1/analytics?${urlParams}`);
        return response.data;
    }catch(e: any){
        throw new Error(e.message);
    }
}