import { useQuery } from "@tanstack/react-query";
import { getAirdropRequests, getAnalytics } from "./api";
import { Chain } from "../enum/chain.enum";
import { Network } from "../enum/network.enum";


export const useSuiGetAirdropRequests = () => {
    return useQuery({
        queryKey: ["sui-airdrop-requests"],
        queryFn: async () => await getAirdropRequests(Chain.SUI, Network.Devnet),
    });
}


export const useSuiGetAnalytics = () => {
    return useQuery({
        queryKey: ["sui-analytics"],
        queryFn: async () => await getAnalytics(Chain.SUI, Network.Devnet),
    });
}


export const useSolanaGetAirdropRequests = (network: Network) => {
    return useQuery({
        queryKey: ["solana-airdrop-requests"],
        queryFn: async () => await getAirdropRequests(Chain.Solana, network),
    });
}


export const useSolanaGetAnalytics = (network: Network) => {
    return useQuery({
        queryKey: ["solana-analytics"],
        queryFn: async () => await getAnalytics(Chain.Solana, network),
    });
}
