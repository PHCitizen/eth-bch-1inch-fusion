export default {
  contractName: 'EscrowSrc',
  constructorInputs: [
    {
      name: 'publicUnlockTimestamp',
      type: 'int',
    },
    {
      name: 'resolverCancellTimestamp',
      type: 'int',
    },
    {
      name: 'publicCancelTimestamp',
      type: 'int',
    },
    {
      name: 'amount',
      type: 'int',
    },
    {
      name: 'token',
      type: 'bytes32',
    },
    {
      name: 'safetyDeposit',
      type: 'int',
    },
    {
      name: 'hashlock',
      type: 'bytes32',
    },
    {
      name: 'resolverPubkHash',
      type: 'bytes20',
    },
    {
      name: 'makerPubkHash',
      type: 'bytes20',
    },
  ],
  abi: [
    {
      name: 'fundSafetyDeposit',
      inputs: [],
    },
    {
      name: 'lockMakerTokens',
      inputs: [],
    },
    {
      name: 'unlock',
      inputs: [
        {
          name: 'isResolver',
          type: 'bool',
        },
        {
          name: 'secret',
          type: 'bytes32',
        },
      ],
    },
    {
      name: 'cancel',
      inputs: [
        {
          name: 'isResolver',
          type: 'bool',
        },
      ],
    },
  ],
  bytecode: 'OP_9 OP_PICK OP_0 OP_NUMEQUAL OP_IF OP_TXVERSION OP_2 OP_NUMEQUALVERIFY OP_INPUTINDEX OP_0 OP_NUMEQUALVERIFY OP_0 OP_OUTPUTBYTECODE OP_0 OP_UTXOBYTECODE OP_EQUALVERIFY OP_0 OP_OUTPUTTOKENCATEGORY OP_0 OP_UTXOTOKENCATEGORY OP_EQUALVERIFY OP_0 OP_OUTPUTTOKENAMOUNT OP_0 OP_UTXOTOKENAMOUNT OP_NUMEQUALVERIFY OP_0 OP_OUTPUTVALUE OP_6 OP_ROLL OP_NUMEQUALVERIFY OP_2DROP OP_2DROP OP_2DROP OP_2DROP OP_DROP OP_1 OP_ELSE OP_9 OP_PICK OP_1 OP_NUMEQUAL OP_IF OP_TXVERSION OP_2 OP_NUMEQUALVERIFY OP_INPUTINDEX OP_0 OP_NUMEQUALVERIFY OP_0 OP_OUTPUTBYTECODE OP_0 OP_UTXOBYTECODE OP_EQUALVERIFY OP_0 OP_OUTPUTTOKENCATEGORY OP_5 OP_ROLL OP_EQUALVERIFY OP_0 OP_OUTPUTTOKENAMOUNT OP_4 OP_ROLL OP_NUMEQUALVERIFY OP_0 OP_OUTPUTVALUE OP_0 OP_UTXOVALUE OP_NUMEQUALVERIFY OP_2DROP OP_2DROP OP_2DROP OP_2DROP OP_1 OP_ELSE OP_9 OP_PICK OP_2 OP_NUMEQUAL OP_IF OP_TXVERSION OP_2 OP_NUMEQUALVERIFY OP_INPUTINDEX OP_0 OP_NUMEQUALVERIFY 76a914 OP_8 OP_ROLL OP_CAT 88ac OP_CAT OP_0 OP_OUTPUTBYTECODE OP_EQUALVERIFY OP_0 OP_OUTPUTTOKENCATEGORY OP_0 OP_UTXOTOKENCATEGORY OP_EQUALVERIFY OP_0 OP_OUTPUTTOKENAMOUNT OP_0 OP_UTXOTOKENAMOUNT OP_NUMEQUALVERIFY OP_10 OP_ROLL OP_SHA256 OP_7 OP_ROLL OP_EQUALVERIFY OP_8 OP_ROLL OP_IF OP_0 OP_OUTPUTVALUE OP_0 OP_UTXOVALUE OP_NUMEQUALVERIFY OP_ELSE OP_TXLOCKTIME OP_OVER OP_GREATERTHANOREQUAL OP_VERIFY OP_ENDIF OP_2DROP OP_2DROP OP_2DROP OP_2DROP OP_1 OP_ELSE OP_9 OP_ROLL OP_3 OP_NUMEQUALVERIFY OP_TXVERSION OP_2 OP_NUMEQUALVERIFY OP_INPUTINDEX OP_0 OP_NUMEQUALVERIFY 76a914 OP_9 OP_ROLL OP_CAT 88ac OP_CAT OP_0 OP_OUTPUTBYTECODE OP_EQUALVERIFY OP_0 OP_OUTPUTTOKENCATEGORY OP_0 OP_UTXOTOKENCATEGORY OP_EQUALVERIFY OP_0 OP_UTXOTOKENAMOUNT OP_0 OP_OUTPUTTOKENAMOUNT OP_NUMEQUALVERIFY OP_8 OP_ROLL OP_IF OP_TXLOCKTIME OP_2 OP_PICK OP_GREATERTHANOREQUAL OP_VERIFY 76a914 OP_8 OP_PICK OP_CAT 88ac OP_CAT OP_1 OP_OUTPUTBYTECODE OP_OVER OP_EQUALVERIFY OP_1 OP_OUTPUTVALUE OP_0 OP_UTXOVALUE OP_NUMEQUALVERIFY OP_DROP OP_ELSE OP_TXLOCKTIME OP_3 OP_PICK OP_GREATERTHANOREQUAL OP_VERIFY OP_ENDIF OP_2DROP OP_2DROP OP_2DROP OP_2DROP OP_1 OP_ENDIF OP_ENDIF OP_ENDIF',
  source: 'pragma cashscript ~0.11.0;\n\ncontract EscrowSrc(\n  // time when other resolver can unlock\n  int publicUnlockTimestamp,\n  // time when resolver can cancel\n  int resolverCancellTimestamp,\n  // time when other resolver can cancel\n  int publicCancelTimestamp,\n  \n  int amount,\n  bytes32 token,\n  int safetyDeposit,\n\n  bytes32 hashlock,\n  bytes20 resolverPubkHash,\n  bytes20 makerPubkHash\n) {\n  // Intentional so resolver expose the contract bytecode\n  function fundSafetyDeposit() {\n    require(tx.version == 2, "Invalid version");\n    require(this.activeInputIndex == 0, "Invalid input index");\n\n    // ensure that all tokens are sent to resolver\n    require(tx.outputs[0].lockingBytecode == tx.inputs[0].lockingBytecode, "Invalid output destination");\n    require(tx.outputs[0].tokenCategory == tx.inputs[0].tokenCategory, "Invalid output category");\n    require(tx.outputs[0].tokenAmount == tx.inputs[0].tokenAmount, "Invalid output token");\n    require(tx.outputs[0].value == safetyDeposit, "Invalid value sats");\n  }\n\n  function lockMakerTokens() {\n    require(tx.version == 2, "Invalid version");\n    require(this.activeInputIndex == 0, "Invalid input index");\n\n    // ensure that all tokens are sent to resolver\n    require(tx.outputs[0].lockingBytecode == tx.inputs[0].lockingBytecode, "Invalid output destination");\n    require(tx.outputs[0].tokenCategory == token, "Invalid output category");\n    require(tx.outputs[0].tokenAmount == amount, "Invalid output token");\n    require(tx.outputs[0].value == tx.inputs[0].value, "Invalid value sats");\n  }\n\n  function unlock(bool isResolver, bytes32 secret) {\n    require(tx.version == 2, "Invalid version");\n    require(this.activeInputIndex == 0, "Invalid input index");\n\n    // ensure that all tokens are sent to resolver\n    bytes resolverLockingBytecode = new LockingBytecodeP2PKH(resolverPubkHash);\n    require(tx.outputs[0].lockingBytecode == resolverLockingBytecode, "Invalid output destination");\n    require(tx.outputs[0].tokenCategory == tx.inputs[0].tokenCategory , "Invalid output category");\n    require(tx.outputs[0].tokenAmount == tx.inputs[0].tokenAmount , "Invalid output token");\n\n    // ensure that secret is revealed\n    require(sha256(secret) == hashlock, "Invalid secret");\n\n    if(isResolver) {\n      // ensure that collateral is sent to resolver\n      require(tx.outputs[0].value == tx.inputs[0].value, "Invalid output collateral");\n    } else {\n      // ensure public unlock time met, \n      //   then they can sent the collateral to anyone using output 1\n      require(tx.locktime >= publicUnlockTimestamp, "Invalid locktime for public unlock");\n    }\n  }\n\n  function cancel(bool isResolver) {\n    require(tx.version == 2, "Invalid version");\n    require(this.activeInputIndex == 0, "Invalid input index");\n\n    // ensure that all tokens are sent to maker\n    bytes makerLockingBytecode = new LockingBytecodeP2PKH(makerPubkHash);\n    require(tx.outputs[0].lockingBytecode == makerLockingBytecode, "Invalid output. Must be the maker");\n    require(tx.outputs[0].tokenCategory == tx.inputs[0].tokenCategory , "Invalid output category");\n    require(tx.inputs[0].tokenAmount == tx.outputs[0].tokenAmount, "Invalid output token");\n\n    if(isResolver) {\n      require(tx.locktime >= resolverCancellTimestamp, "Invalid locktime for resolver cancel");\n\n      // ensure that collateral is sent to resolver\n      bytes resolverLockingBytecode = new LockingBytecodeP2PKH(resolverPubkHash);\n      require(tx.outputs[1].lockingBytecode == resolverLockingBytecode, "Invalid output1 destination");\n      require(tx.outputs[1].value == tx.inputs[0].value, "Invalid output1 collateral");\n    } else {\n      // ensure puvlic cancel time met, \n      //   then they can sent the collateral to anyone using output 1\n      require(tx.locktime >= publicCancelTimestamp, "Invalid locktime for public cancel");\n    }\n  }\n}\n',
  debug: {
    bytecode: '5979009c63c2529dc0009d00cd00c78800d100ce8800d300d09d00cc567a9d6d6d6d6d7551675979519c63c2529dc0009d00cd00c78800d1557a8800d3547a9d00cc00c69d6d6d6d6d51675979529c63c2529dc0009d0376a914587a7e0288ac7e00cd8800d100ce8800d300d09d5a7aa8577a88587a6300cc00c69d67c578a269686d6d6d6d5167597a539dc2529dc0009d0376a914597a7e0288ac7e00cd8800d100ce8800d000d39d587a63c55279a2690376a91458797e0288ac7e51cd788851cc00c69d7567c55379a269686d6d6d6d51686868',
    sourceMap: '20:2:29:3;;;;;21:12:21:22;:26::27;:4::48:1;22:12:22:33:0;:37::38;:4::63:1;25:23:25:24:0;:12::41:1;:55::56:0;:45::73:1;:4::105;26:23:26:24:0;:12::39:1;:53::54:0;:43::69:1;:4::98;27:23:27:24:0;:12::37:1;:51::52:0;:41::65:1;:4::91;28:23:28:24:0;:12::31:1;:35::48:0;;:4::72:1;20:2:29:3;;;;;;;31::40::0;;;;;32:12:32:22;:26::27;:4::48:1;33:12:33:33:0;:37::38;:4::63:1;36:23:36:24:0;:12::41:1;:55::56:0;:45::73:1;:4::105;37:23:37:24:0;:12::39:1;:43::48:0;;:4::77:1;38:23:38:24:0;:12::37:1;:41::47:0;;:4::73:1;39:23:39:24:0;:12::31:1;:45::46:0;:35::53:1;:4::77;31:2:40:3;;;;;;42::63::0;;;;;43:12:43:22;:26::27;:4::48:1;44:12:44:33:0;:37::38;:4::63:1;47:36:47:78:0;:61::77;;:36::78:1;;;48:23:48:24:0;:12::41:1;:4::100;49:23:49:24:0;:12::39:1;:53::54:0;:43::69:1;:4::99;50:23:50:24:0;:12::37:1;:51::52:0;:41::65:1;:4::92;53:19:53:25:0;;:12::26:1;:30::38:0;;:4::58:1;55:7:55:17:0;;:19:58:5;57:25:57:26;:14::33:1;:47::48:0;:37::55:1;:6::86;58:11:62:5:0;61:14:61:25;:29::50;:14:::1;:6::90;58:11:62:5;42:2:63:3;;;;;;65::87::0;;;;66:12:66:22;:26::27;:4::48:1;67:12:67:33:0;:37::38;:4::63:1;70:33:70:72:0;:58::71;;:33::72:1;;;71:23:71:24:0;:12::41:1;:4::104;72:23:72:24:0;:12::39:1;:53::54:0;:43::69:1;:4::99;73:22:73:23:0;:12::36:1;:51::52:0;:40::65:1;:4::91;75:7:75:17:0;;:19:82:5;76:14:76:25;:29::53;;:14:::1;:6::95;79:38:79:80:0;:63::79;;:38::80:1;;;80:25:80:26:0;:14::43:1;:47::70:0;:6::103:1;81:25:81:26:0;:14::33:1;:47::48:0;:37::55:1;:6::87;75:19:82:5;82:11:86::0;85:14:85:25;:29::50;;:14:::1;:6::90;82:11:86:5;65:2:87:3;;;;;3:0:88:1;;',
    logs: [],
    requires: [
      {
        ip: 16,
        line: 21,
        message: 'Invalid version',
      },
      {
        ip: 19,
        line: 22,
        message: 'Invalid input index',
      },
      {
        ip: 24,
        line: 25,
        message: 'Invalid output destination',
      },
      {
        ip: 29,
        line: 26,
        message: 'Invalid output category',
      },
      {
        ip: 34,
        line: 27,
        message: 'Invalid output token',
      },
      {
        ip: 39,
        line: 28,
        message: 'Invalid value sats',
      },
      {
        ip: 54,
        line: 32,
        message: 'Invalid version',
      },
      {
        ip: 57,
        line: 33,
        message: 'Invalid input index',
      },
      {
        ip: 62,
        line: 36,
        message: 'Invalid output destination',
      },
      {
        ip: 67,
        line: 37,
        message: 'Invalid output category',
      },
      {
        ip: 72,
        line: 38,
        message: 'Invalid output token',
      },
      {
        ip: 77,
        line: 39,
        message: 'Invalid value sats',
      },
      {
        ip: 91,
        line: 43,
        message: 'Invalid version',
      },
      {
        ip: 94,
        line: 44,
        message: 'Invalid input index',
      },
      {
        ip: 103,
        line: 48,
        message: 'Invalid output destination',
      },
      {
        ip: 108,
        line: 49,
        message: 'Invalid output category',
      },
      {
        ip: 113,
        line: 50,
        message: 'Invalid output token',
      },
      {
        ip: 119,
        line: 53,
        message: 'Invalid secret',
      },
      {
        ip: 127,
        line: 57,
        message: 'Invalid output collateral',
      },
      {
        ip: 132,
        line: 61,
        message: 'Invalid locktime for public unlock',
      },
      {
        ip: 146,
        line: 66,
        message: 'Invalid version',
      },
      {
        ip: 149,
        line: 67,
        message: 'Invalid input index',
      },
      {
        ip: 158,
        line: 71,
        message: 'Invalid output. Must be the maker',
      },
      {
        ip: 163,
        line: 72,
        message: 'Invalid output category',
      },
      {
        ip: 168,
        line: 73,
        message: 'Invalid output token',
      },
      {
        ip: 176,
        line: 76,
        message: 'Invalid locktime for resolver cancel',
      },
      {
        ip: 186,
        line: 80,
        message: 'Invalid output1 destination',
      },
      {
        ip: 191,
        line: 81,
        message: 'Invalid output1 collateral',
      },
      {
        ip: 198,
        line: 85,
        message: 'Invalid locktime for public cancel',
      },
    ],
  },
  compiler: {
    name: 'cashc',
    version: '0.11.3',
  },
  updatedAt: '2025-07-31T03:04:37.774Z',
} as const;
