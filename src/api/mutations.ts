import {useMutation} from "@tanstack/react-query";
import { requestAirdrop } from "./api";




export const useAirdropMutation = () => {
    return useMutation({
        mutationKey: ["airdrop"],
        mutationFn: (data: {address: string, amount: number}) => requestAirdrop(data.address, data.amount)
    })
}