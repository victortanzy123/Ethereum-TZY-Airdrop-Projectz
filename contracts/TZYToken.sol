pragma solidity 0.8.6;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract TZYToken is ERC20 {
    constructor() ERC20("Tan Zuu-Yuaan Token", "TZY") {
        _mint(msg.sender, 1000000 * 10**18);
    }
}
