import type { Chain } from "../enum/chain.enum";
import type { Network } from "../enum/network.enum";

export default interface AirdropRequest {
    id: number;
    address: string;
    amount: number;
    status: string;
    network: Network;
    chain: Chain;
    createdAt: string;
    updatedAt: string;
}