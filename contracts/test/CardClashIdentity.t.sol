// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Test} from "forge-std/Test.sol";
import {CardClashIdentity} from "../src/CardClashIdentity.sol";

contract CardClashIdentityTest is Test {
    CardClashIdentity id;
    address alice = address(0xA11CE);
    address bob = address(0xB0B);

    function setUp() public {
        id = new CardClashIdentity();
    }

    function test_RegisterAndRead() public {
        vm.prank(alice);
        id.setUsername("Mbappe");
        (string memory name,,, bool registered) = id.getProfile(alice);
        assertEq(name, "Mbappe");
        assertTrue(registered);
    }

    function test_UsernameTaken() public {
        vm.prank(alice);
        id.setUsername("Goat");
        vm.prank(bob);
        vm.expectRevert(CardClashIdentity.UsernameTaken.selector);
        id.setUsername("GOAT"); // case-insensitive collision
    }

    function test_ChangeUsernameFreesOld() public {
        vm.startPrank(alice);
        id.setUsername("First");
        id.setUsername("Second");
        vm.stopPrank();
        assertTrue(id.isAvailable("First"));
        assertFalse(id.isAvailable("Second"));
    }

    function test_RecordWin() public {
        vm.prank(alice);
        id.setUsername("Winner");
        vm.prank(alice);
        id.recordWin(bob);
        (, uint64 wins,,) = id.getProfile(alice);
        (,, uint64 losses,) = id.getProfile(bob);
        assertEq(wins, 1);
        assertEq(losses, 1);
    }

    function test_RecordWinRequiresRegistration() public {
        vm.prank(alice);
        vm.expectRevert(CardClashIdentity.NotRegistered.selector);
        id.recordWin(bob);
    }
}
