import { useQuery } from "@tanstack/react-query";
import { getAirdropRequests, getAnalytics } from "./api";


export const useGetAirdropRequests = () => {
    return useQuery({
        queryKey: ["airdrop-requests"],
        queryFn: async () => await getAirdropRequests(),
    });
}


export const useGetAnalytics = () => {
    return useQuery({
        queryKey: ["analytics"],
        queryFn: async () => await getAnalytics(),
    });
}