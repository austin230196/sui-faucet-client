import {useMutation} from "@tanstack/react-query";
import { requestAirdrop, requestSolanaAirdrop } from "./api";
import type { Network } from "../enum/network.enum";




export const useSuiAirdropMutation = () => {
    return useMutation({
        mutationKey: ["sui-airdrop"],
        mutationFn: (data: {address: string, amount: number}) => requestAirdrop(data.address, data.amount)
    })
}

export const useSolanaAirdropMutation = () => {
    return useMutation({
        mutationKey: ["solana-airdrop"],
        mutationFn: (data: {address: string, amount: number, network: Network}) => requestSolanaAirdrop(data.network, data.address, data.amount)
    })
}
