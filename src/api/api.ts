import { axiosInstance } from "../axios";


export const requestAirdrop = async (address: string, amount: number) => {
    try{
        let response = await axiosInstance.post(`/airdrop`, {
            address,
            amount
        });

        console.log("[*] Airdrop request sent successfully");
        return response.data;
    }catch(e: any){
        throw new Error(e.message);
    }
}


export const getAirdropRequests = async () => {
    try{
        let response = await axiosInstance.get(`/recent-requests`);
        return response.data;
    }catch(e: any){
        throw new Error(e.message);
    }
}


export const getAnalytics = async () => {
    try{
        let response = await axiosInstance.get(`/analytics`);
        return response.data;
    }catch(e: any){
        throw new Error(e.message);
    }
}