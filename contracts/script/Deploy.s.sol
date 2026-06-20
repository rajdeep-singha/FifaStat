// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Script, console} from "forge-std/Script.sol";
import {CardClashIdentity} from "../src/CardClashIdentity.sol";

contract Deploy is Script {
    function run() external returns (CardClashIdentity id) {
        uint256 pk = vm.envUint("PRIVATE_KEY");
        vm.startBroadcast(pk);
        id = new CardClashIdentity();
        vm.stopBroadcast();
        console.log("CardClashIdentity deployed at:", address(id));
    }
}
