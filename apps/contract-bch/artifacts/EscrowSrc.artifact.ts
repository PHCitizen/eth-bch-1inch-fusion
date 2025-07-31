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
  bytecode: 'OP_9 OP_PICK OP_0 OP_NUMEQUAL OP_IF OP_TXVERSION OP_2 OP_NUMEQUALVERIFY OP_INPUTINDEX OP_0 OP_NUMEQUALVERIFY OP_0 OP_UTXOTOKENCATEGORY OP_0 20 OP_NUM2BIN OP_EQUALVERIFY OP_0 OP_UTXOTOKENAMOUNT OP_0 OP_NUMEQUALVERIFY OP_0 OP_OUTPUTBYTECODE OP_0 OP_UTXOBYTECODE OP_EQUALVERIFY OP_0 OP_OUTPUTTOKENCATEGORY OP_5 OP_ROLL OP_EQUALVERIFY OP_0 OP_OUTPUTTOKENAMOUNT OP_4 OP_ROLL OP_NUMEQUALVERIFY OP_0 OP_OUTPUTVALUE OP_4 OP_ROLL OP_NUMEQUALVERIFY OP_2DROP OP_2DROP OP_2DROP OP_DROP OP_1 OP_ELSE OP_9 OP_PICK OP_1 OP_NUMEQUAL OP_IF OP_TXVERSION OP_2 OP_NUMEQUALVERIFY OP_INPUTINDEX OP_0 OP_NUMEQUALVERIFY OP_0 OP_OUTPUTBYTECODE OP_0 OP_UTXOBYTECODE OP_EQUALVERIFY OP_0 OP_OUTPUTTOKENCATEGORY OP_5 OP_ROLL OP_EQUALVERIFY OP_0 OP_OUTPUTTOKENAMOUNT OP_4 OP_ROLL OP_NUMEQUALVERIFY OP_0 OP_OUTPUTVALUE OP_0 OP_UTXOVALUE OP_NUMEQUALVERIFY OP_2DROP OP_2DROP OP_2DROP OP_2DROP OP_1 OP_ELSE OP_9 OP_PICK OP_2 OP_NUMEQUAL OP_IF OP_TXVERSION OP_2 OP_NUMEQUALVERIFY OP_INPUTINDEX OP_0 OP_NUMEQUALVERIFY 76a914 OP_8 OP_ROLL OP_CAT 88ac OP_CAT OP_0 OP_OUTPUTBYTECODE OP_EQUALVERIFY OP_0 OP_OUTPUTTOKENCATEGORY OP_0 OP_UTXOTOKENCATEGORY OP_EQUALVERIFY OP_0 OP_OUTPUTTOKENAMOUNT OP_0 OP_UTXOTOKENAMOUNT OP_NUMEQUALVERIFY OP_10 OP_ROLL OP_SHA256 OP_7 OP_ROLL OP_EQUALVERIFY OP_8 OP_ROLL OP_IF OP_0 OP_OUTPUTVALUE OP_0 OP_UTXOVALUE OP_NUMEQUALVERIFY OP_ELSE OP_TXLOCKTIME OP_OVER OP_GREATERTHANOREQUAL OP_VERIFY OP_ENDIF OP_2DROP OP_2DROP OP_2DROP OP_2DROP OP_1 OP_ELSE OP_9 OP_ROLL OP_3 OP_NUMEQUALVERIFY OP_TXVERSION OP_2 OP_NUMEQUALVERIFY OP_INPUTINDEX OP_0 OP_NUMEQUALVERIFY 76a914 OP_9 OP_ROLL OP_CAT 88ac OP_CAT OP_0 OP_OUTPUTBYTECODE OP_EQUALVERIFY OP_0 OP_OUTPUTTOKENCATEGORY OP_0 OP_UTXOTOKENCATEGORY OP_EQUALVERIFY OP_0 OP_UTXOTOKENAMOUNT OP_0 OP_OUTPUTTOKENAMOUNT OP_NUMEQUALVERIFY OP_8 OP_ROLL OP_IF OP_TXLOCKTIME OP_2 OP_PICK OP_GREATERTHANOREQUAL OP_VERIFY 76a914 OP_8 OP_PICK OP_CAT 88ac OP_CAT OP_1 OP_OUTPUTBYTECODE OP_OVER OP_EQUALVERIFY OP_1 OP_OUTPUTVALUE OP_0 OP_UTXOVALUE OP_NUMEQUALVERIFY OP_DROP OP_ELSE OP_TXLOCKTIME OP_3 OP_PICK OP_GREATERTHANOREQUAL OP_VERIFY OP_ENDIF OP_2DROP OP_2DROP OP_2DROP OP_2DROP OP_1 OP_ENDIF OP_ENDIF OP_ENDIF',
  source: 'pragma cashscript ~0.11.0;\n\ncontract EscrowSrc(\n  // time when other resolver can unlock\n  int publicUnlockTimestamp,\n  // time when resolver can cancel\n  int resolverCancellTimestamp,\n  // time when other resolver can cancel\n  int publicCancelTimestamp,\n  \n  int amount,\n  bytes32 token,\n  int safetyDeposit,\n\n  bytes32 hashlock,\n  bytes20 resolverPubkHash,\n  bytes20 makerPubkHash\n) {\n  // Intentional so resolver expose the contract bytecode\n  function fundSafetyDeposit() {\n    require(tx.version == 2, "Invalid version");\n    require(this.activeInputIndex == 0, "Invalid input index");\n\n    require(tx.inputs[0].tokenCategory == bytes32(0), "Contract must be empty");\n    require(tx.inputs[0].tokenAmount == 0, "Contract must be empty");\n\n    require(tx.outputs[0].lockingBytecode == tx.inputs[0].lockingBytecode, "Invalid output destination");\n    require(tx.outputs[0].tokenCategory == token, "Invalid output category");\n    require(tx.outputs[0].tokenAmount == amount, "Invalid output token");\n    require(tx.outputs[0].value == safetyDeposit, "Invalid value sats");\n  }\n\n  function lockMakerTokens() {\n    require(tx.version == 2, "Invalid version");\n    require(this.activeInputIndex == 0, "Invalid input index");\n\n    // ensure that all tokens are sent to resolver\n    require(tx.outputs[0].lockingBytecode == tx.inputs[0].lockingBytecode, "Invalid output destination");\n    require(tx.outputs[0].tokenCategory == token, "Invalid output category");\n    require(tx.outputs[0].tokenAmount == amount, "Invalid output token");\n    require(tx.outputs[0].value == tx.inputs[0].value, "Invalid value sats");\n  }\n\n  function unlock(bool isResolver, bytes32 secret) {\n    require(tx.version == 2, "Invalid version");\n    require(this.activeInputIndex == 0, "Invalid input index");\n\n    // ensure that all tokens are sent to resolver\n    bytes resolverLockingBytecode = new LockingBytecodeP2PKH(resolverPubkHash);\n    require(tx.outputs[0].lockingBytecode == resolverLockingBytecode, "Invalid output destination");\n    require(tx.outputs[0].tokenCategory == tx.inputs[0].tokenCategory , "Invalid output category");\n    require(tx.outputs[0].tokenAmount == tx.inputs[0].tokenAmount , "Invalid output token");\n\n    // ensure that secret is revealed\n    require(sha256(secret) == hashlock, "Invalid secret");\n\n    if(isResolver) {\n      // ensure that collateral is sent to resolver\n      require(tx.outputs[0].value == tx.inputs[0].value, "Invalid output collateral");\n    } else {\n      // ensure public unlock time met, \n      //   then they can sent the collateral to anyone using output 1\n      require(tx.locktime >= publicUnlockTimestamp, "Invalid locktime for public unlock");\n    }\n  }\n\n  function cancel(bool isResolver) {\n    require(tx.version == 2, "Invalid version");\n    require(this.activeInputIndex == 0, "Invalid input index");\n\n    // ensure that all tokens are sent to maker\n    bytes makerLockingBytecode = new LockingBytecodeP2PKH(makerPubkHash);\n    require(tx.outputs[0].lockingBytecode == makerLockingBytecode, "Invalid output. Must be the maker");\n    require(tx.outputs[0].tokenCategory == tx.inputs[0].tokenCategory , "Invalid output category");\n    require(tx.inputs[0].tokenAmount == tx.outputs[0].tokenAmount, "Invalid output token");\n\n    if(isResolver) {\n      require(tx.locktime >= resolverCancellTimestamp, "Invalid locktime for resolver cancel");\n\n      // ensure that collateral is sent to resolver\n      bytes resolverLockingBytecode = new LockingBytecodeP2PKH(resolverPubkHash);\n      require(tx.outputs[1].lockingBytecode == resolverLockingBytecode, "Invalid output1 destination");\n      require(tx.outputs[1].value == tx.inputs[0].value, "Invalid output1 collateral");\n    } else {\n      // ensure puvlic cancel time met, \n      //   then they can sent the collateral to anyone using output 1\n      require(tx.locktime >= publicCancelTimestamp, "Invalid locktime for public cancel");\n    }\n  }\n}\n',
  debug: {
    bytecode: '5979009c63c2529dc0009d00ce000120808800d0009d00cd00c78800d1557a8800d3547a9d00cc547a9d6d6d6d7551675979519c63c2529dc0009d00cd00c78800d1557a8800d3547a9d00cc00c69d6d6d6d6d51675979529c63c2529dc0009d0376a914587a7e0288ac7e00cd8800d100ce8800d300d09d5a7aa8577a88587a6300cc00c69d67c578a269686d6d6d6d5167597a539dc2529dc0009d0376a914597a7e0288ac7e00cd8800d100ce8800d000d39d587a63c55279a2690376a91458797e0288ac7e51cd788851cc00c69d7567c55379a269686d6d6d6d51686868',
    sourceMap: '20:2:31:3;;;;;21:12:21:22;:26::27;:4::48:1;22:12:22:33:0;:37::38;:4::63:1;24:22:24:23:0;:12::38:1;:50::51:0;:42::52:1;;:4::80;25:22:25:23:0;:12::36:1;:40::41:0;:4::69:1;27:23:27:24:0;:12::41:1;:55::56:0;:45::73:1;:4::105;28:23:28:24:0;:12::39:1;:43::48:0;;:4::77:1;29:23:29:24:0;:12::37:1;:41::47:0;;:4::73:1;30:23:30:24:0;:12::31:1;:35::48:0;;:4::72:1;20:2:31:3;;;;;;33::42::0;;;;;34:12:34:22;:26::27;:4::48:1;35:12:35:33:0;:37::38;:4::63:1;38:23:38:24:0;:12::41:1;:55::56:0;:45::73:1;:4::105;39:23:39:24:0;:12::39:1;:43::48:0;;:4::77:1;40:23:40:24:0;:12::37:1;:41::47:0;;:4::73:1;41:23:41:24:0;:12::31:1;:45::46:0;:35::53:1;:4::77;33:2:42:3;;;;;;44::65::0;;;;;45:12:45:22;:26::27;:4::48:1;46:12:46:33:0;:37::38;:4::63:1;49:36:49:78:0;:61::77;;:36::78:1;;;50:23:50:24:0;:12::41:1;:4::100;51:23:51:24:0;:12::39:1;:53::54:0;:43::69:1;:4::99;52:23:52:24:0;:12::37:1;:51::52:0;:41::65:1;:4::92;55:19:55:25:0;;:12::26:1;:30::38:0;;:4::58:1;57:7:57:17:0;;:19:60:5;59:25:59:26;:14::33:1;:47::48:0;:37::55:1;:6::86;60:11:64:5:0;63:14:63:25;:29::50;:14:::1;:6::90;60:11:64:5;44:2:65:3;;;;;;67::89::0;;;;68:12:68:22;:26::27;:4::48:1;69:12:69:33:0;:37::38;:4::63:1;72:33:72:72:0;:58::71;;:33::72:1;;;73:23:73:24:0;:12::41:1;:4::104;74:23:74:24:0;:12::39:1;:53::54:0;:43::69:1;:4::99;75:22:75:23:0;:12::36:1;:51::52:0;:40::65:1;:4::91;77:7:77:17:0;;:19:84:5;78:14:78:25;:29::53;;:14:::1;:6::95;81:38:81:80:0;:63::79;;:38::80:1;;;82:25:82:26:0;:14::43:1;:47::70:0;:6::103:1;83:25:83:26:0;:14::33:1;:47::48:0;:37::55:1;:6::87;77:19:84:5;84:11:88::0;87:14:87:25;:29::50;;:14:::1;:6::90;84:11:88:5;67:2:89:3;;;;;3:0:90:1;;',
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
        ip: 25,
        line: 24,
        message: 'Contract must be empty',
      },
      {
        ip: 29,
        line: 25,
        message: 'Contract must be empty',
      },
      {
        ip: 34,
        line: 27,
        message: 'Invalid output destination',
      },
      {
        ip: 39,
        line: 28,
        message: 'Invalid output category',
      },
      {
        ip: 44,
        line: 29,
        message: 'Invalid output token',
      },
      {
        ip: 49,
        line: 30,
        message: 'Invalid value sats',
      },
      {
        ip: 63,
        line: 34,
        message: 'Invalid version',
      },
      {
        ip: 66,
        line: 35,
        message: 'Invalid input index',
      },
      {
        ip: 71,
        line: 38,
        message: 'Invalid output destination',
      },
      {
        ip: 76,
        line: 39,
        message: 'Invalid output category',
      },
      {
        ip: 81,
        line: 40,
        message: 'Invalid output token',
      },
      {
        ip: 86,
        line: 41,
        message: 'Invalid value sats',
      },
      {
        ip: 100,
        line: 45,
        message: 'Invalid version',
      },
      {
        ip: 103,
        line: 46,
        message: 'Invalid input index',
      },
      {
        ip: 112,
        line: 50,
        message: 'Invalid output destination',
      },
      {
        ip: 117,
        line: 51,
        message: 'Invalid output category',
      },
      {
        ip: 122,
        line: 52,
        message: 'Invalid output token',
      },
      {
        ip: 128,
        line: 55,
        message: 'Invalid secret',
      },
      {
        ip: 136,
        line: 59,
        message: 'Invalid output collateral',
      },
      {
        ip: 141,
        line: 63,
        message: 'Invalid locktime for public unlock',
      },
      {
        ip: 155,
        line: 68,
        message: 'Invalid version',
      },
      {
        ip: 158,
        line: 69,
        message: 'Invalid input index',
      },
      {
        ip: 167,
        line: 73,
        message: 'Invalid output. Must be the maker',
      },
      {
        ip: 172,
        line: 74,
        message: 'Invalid output category',
      },
      {
        ip: 177,
        line: 75,
        message: 'Invalid output token',
      },
      {
        ip: 185,
        line: 78,
        message: 'Invalid locktime for resolver cancel',
      },
      {
        ip: 195,
        line: 82,
        message: 'Invalid output1 destination',
      },
      {
        ip: 200,
        line: 83,
        message: 'Invalid output1 collateral',
      },
      {
        ip: 207,
        line: 87,
        message: 'Invalid locktime for public cancel',
      },
    ],
  },
  compiler: {
    name: 'cashc',
    version: '0.11.3',
  },
  updatedAt: '2025-07-31T12:45:45.841Z',
} as const;
