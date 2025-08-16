import {createBrowserRouter, type RouteObject} from "react-router";

import SuiFaucetDApp from "./pages/sui";
import SolanaFaucetDApp from "./pages/solana";


const routes: RouteObject[] = [
    {
        path: "/",
        Component: SuiFaucetDApp
    },
    {
        path: "/solana",
        Component: SolanaFaucetDApp
    }
];


const router = createBrowserRouter(routes, {});


export default router;