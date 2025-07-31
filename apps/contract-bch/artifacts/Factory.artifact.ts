export default {
  contractName: 'PreLockOrder',
  constructorInputs: [
    {
      name: 'escrowSrcBytecodePrefix',
      type: 'bytes',
    },
    {
      name: 'escrowSrcBytecode',
      type: 'bytes',
    },
    {
      name: 'accessToken',
      type: 'bytes32',
    },
  ],
  abi: [
    {
      name: 'deploySrc',
      inputs: [
        {
          name: 'orderHash',
          type: 'bytes32',
        },
        {
          name: 'hashlock',
          type: 'bytes32',
        },
        {
          name: 'makerPubkey',
          type: 'pubkey',
        },
        {
          name: 'token',
          type: 'bytes32',
        },
        {
          name: 'amount',
          type: 'bytes32',
        },
        {
          name: 'safetyDeposit',
          type: 'int',
        },
        {
          name: 'srcPrivateWithdrawalLock',
          type: 'bytes4',
        },
        {
          name: 'srcPublicWithdrawalLock',
          type: 'bytes4',
        },
        {
          name: 'srcPrivateCancellationLock',
          type: 'bytes4',
        },
        {
          name: 'deployedAt',
          type: 'bytes4',
        },
        {
          name: 'makerSig',
          type: 'datasig',
        },
        {
          name: 'resolverPubkey',
          type: 'pubkey',
        },
      ],
    },
  ],
  bytecode: 'OP_TXVERSION OP_2 OP_NUMEQUALVERIFY OP_INPUTINDEX OP_0 OP_NUMEQUALVERIFY OP_0 OP_OUTPUTBYTECODE OP_0 OP_UTXOBYTECODE OP_EQUALVERIFY OP_0 OP_OUTPUTVALUE OP_0 OP_UTXOVALUE OP_NUMEQUALVERIFY OP_1 OP_UTXOTOKENCATEGORY OP_3 OP_ROLL OP_EQUALVERIFY OP_ROT OP_3 OP_PICK OP_CAT OP_4 OP_PICK OP_CAT OP_5 OP_PICK OP_CAT OP_6 OP_ROLL OP_CAT OP_6 OP_PICK OP_CAT OP_11 OP_ROLL OP_SWAP OP_5 OP_PICK OP_CHECKDATASIGVERIFY 14 OP_4 OP_ROLL OP_HASH160 OP_CAT 14 OP_CAT OP_10 OP_ROLL OP_HASH160 OP_CAT 20 OP_CAT OP_3 OP_ROLL OP_CAT OP_4 OP_CAT OP_8 OP_PICK OP_8 OP_ROLL OP_CAT OP_CAT OP_4 OP_CAT OP_7 OP_PICK OP_7 OP_ROLL OP_CAT OP_CAT OP_4 OP_CAT OP_6 OP_ROLL OP_6 OP_ROLL OP_CAT OP_CAT OP_SWAP OP_CAT OP_SWAP OP_CAT aa 20 OP_CAT OP_SWAP OP_HASH256 OP_CAT 87 OP_CAT OP_1 OP_OUTPUTBYTECODE OP_EQUALVERIFY OP_1 OP_OUTPUTVALUE OP_ROT OP_NUMEQUALVERIFY OP_1 OP_OUTPUTTOKENCATEGORY OP_EQUAL',
  source: 'pragma cashscript ~0.11.0;\n\n\n/**\n * User can lock funds when creating order, then the taker can get funds without\n *    waiting the user to funds to the escrow\n * This is the equivalent of pulling system on EVM where user give allowance to LOP \n *    then LOP send tokens to escrow\n */\ncontract PreLockOrder(\n  // OP push operation to push escrowSrcBytecode to the stack\n  bytes escrowSrcBytecodePrefix,\n  bytes escrowSrcBytecode,\n\n  bytes32 accessToken,\n) {\n  function deploySrc(\n    bytes32 orderHash,\n    bytes32 hashlock,\n    pubkey makerPubkey,\n    bytes32 token,\n    bytes32 amount,\n    int safetyDeposit,\n\n    // delay where stage ends\n    // we can say that deployAt + srcPrivateWithdrawalLock == resolver cant withdraw\n    // bytes4 srcFinalityLock,\n    bytes4 srcPrivateWithdrawalLock,\n    bytes4 srcPublicWithdrawalLock,\n    bytes4 srcPrivateCancellationLock,\n    // bytes4 dstFinalityLock,\n    // bytes4 dstPrivateWithdrawalLock,\n    // bytes4 dstPublicWithdrawalLock,\n    bytes4 deployedAt,\n\n    datasig makerSig,\n    pubkey resolverPubkey,\n  ) {\n    require(tx.version == 2, "Invalid version");\n    require(this.activeInputIndex == 0, "Invalid input index");\n\n    // require recursive contract\n    require(tx.outputs[0].lockingBytecode == tx.inputs[0].lockingBytecode, "");\n    require(tx.outputs[0].value == tx.inputs[0].value, "");\n\n    // check that resolver has access by checking if they have access nft\n    require(tx.inputs[1].tokenCategory == accessToken, "Access token required");\n\n    // bytes32 timelocks = deployedAt + dstPublicWithdrawalLock + dstPrivateWithdrawalLock + dstFinalityLock\n    //             + srcPrivateCancellationLock + srcPublicWithdrawalLock + srcPrivateWithdrawalLock + srcFinalityLock;\n    bytes order = orderHash + hashlock + bytes(makerPubkey) + token + amount + bytes(safetyDeposit);\n    \n    // check that owner makes the order\n    require(checkDataSig(makerSig, order, makerPubkey), "Invalid owner sig");\n\n    bytes computeContract = \n        0x14 + hash160(makerPubkey)\n        + 0x14 + hash160(resolverPubkey)\n        + 0x20 + hashlock\n        + 0x04 + (deployedAt + srcPrivateCancellationLock)\n        + 0x04 + (deployedAt + srcPublicWithdrawalLock)\n        + 0x04 + (deployedAt + srcPrivateWithdrawalLock)\n        + escrowSrcBytecodePrefix + escrowSrcBytecode;\n    //                              OP_HASH256   OP_PUSH_32   < 32_BYTES >               OP_EQUAL\n    bytes contractLockingBytecode = 0xaa       + 0x20       + hash256(computeContract) + 0x87;\n    require(tx.outputs[1].lockingBytecode == contractLockingBytecode, "");\n    require(tx.outputs[1].value == safetyDeposit, "Invalid safety deposit");\n    require(tx.outputs[1].tokenCategory == token, "Invalid token category");\n  }\n}',
  debug: {
    bytecode: 'c2529dc0009d00cd00c78800cc00c69d51ce537a887b53797e54797e55797e567a7e56797e5b7a7c5579bb0114547aa97e01147e5a7aa97e01207e537a7e547e5879587a7e7e547e5779577a7e7e547e567a567a7e7e7c7e7c7e01aa01207e7caa7e01877e51cd8851cc7b9d51d187',
    sourceMap: '39:12:39:22;:26::27;:4::48:1;40:12:40:33:0;:37::38;:4::63:1;43:23:43:24:0;:12::41:1;:55::56:0;:45::73:1;:4::79;44:23:44:24:0;:12::31:1;:45::46:0;:35::53:1;:4::59;47:22:47:23:0;:12::38:1;:42::53:0;;:4::80:1;51:18:51:27:0;:30::38;;:18:::1;:47::58:0;;:18::59:1;:62::67:0;;:18:::1;:70::76:0;;:18:::1;:85::98:0;;:18::99:1;54:25:54:33:0;;:35::40;:42::53;;:4::77:1;57:8:57:12:0;:23::34;;:15::35:1;:8;58:10:58:14:0;57:8:::1;58:25::39:0;;:17::40:1;57:8;59:10:59:14:0;57:8:::1;59:17::25:0;;57:8:::1;60:10:60:14:0;57:8:::1;60:18::28:0;;:31::57;;:18:::1;57:8::58;61:10:61:14:0;57:8:::1;61:18::28:0;;:31::54;;:18:::1;57:8::55;62:10:62:14:0;57:8:::1;62:18::28:0;;:31::55;;:18:::1;57:8::56;63:10:63:33:0;57:8:::1;63:36::53:0;57:8:::1;65:36:65:40:0;:49::53;:36:::1;:70::85:0;:62::86:1;:36;:89::93:0;:36:::1;66:23:66:24:0;:12::41:1;:4::74;67:23:67:24:0;:12::31:1;:35::48:0;:4::76:1;68:23:68:24:0;:12::39:1;:4::76',
    logs: [],
    requires: [
      {
        ip: 5,
        line: 39,
        message: 'Invalid version',
      },
      {
        ip: 8,
        line: 40,
        message: 'Invalid input index',
      },
      {
        ip: 13,
        line: 43,
        message: '',
      },
      {
        ip: 18,
        line: 44,
        message: '',
      },
      {
        ip: 23,
        line: 47,
        message: 'Access token required',
      },
      {
        ip: 45,
        line: 54,
        message: 'Invalid owner sig',
      },
      {
        ip: 100,
        line: 66,
        message: '',
      },
      {
        ip: 104,
        line: 67,
        message: 'Invalid safety deposit',
      },
      {
        ip: 108,
        line: 68,
        message: 'Invalid token category',
      },
    ],
  },
  compiler: {
    name: 'cashc',
    version: '0.11.3',
  },
  updatedAt: '2025-07-31T03:04:38.716Z',
} as const;
