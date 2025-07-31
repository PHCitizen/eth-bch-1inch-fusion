export default {
  contractName: 'EscrowDst',
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
      name: 'fundSafetyDepositAndToken',
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
      inputs: [],
    },
  ],
  bytecode: 'OP_8 OP_PICK OP_0 OP_NUMEQUAL OP_IF OP_TXVERSION OP_2 OP_NUMEQUALVERIFY OP_INPUTINDEX OP_0 OP_NUMEQUALVERIFY OP_0 OP_OUTPUTBYTECODE OP_0 OP_UTXOBYTECODE OP_EQUALVERIFY OP_0 OP_OUTPUTTOKENCATEGORY OP_4 OP_ROLL OP_EQUALVERIFY OP_0 OP_OUTPUTTOKENAMOUNT OP_3 OP_ROLL OP_NUMEQUALVERIFY OP_0 OP_OUTPUTVALUE OP_3 OP_ROLL OP_NUMEQUALVERIFY OP_2DROP OP_2DROP OP_2DROP OP_1 OP_ELSE OP_8 OP_PICK OP_1 OP_NUMEQUAL OP_IF OP_TXVERSION OP_2 OP_NUMEQUALVERIFY OP_INPUTINDEX OP_0 OP_NUMEQUALVERIFY 76a914 OP_8 OP_ROLL OP_CAT 88ac OP_CAT OP_0 OP_OUTPUTBYTECODE OP_EQUALVERIFY OP_0 OP_OUTPUTTOKENCATEGORY OP_0 OP_UTXOTOKENCATEGORY OP_EQUALVERIFY OP_0 OP_OUTPUTTOKENAMOUNT OP_0 OP_UTXOTOKENAMOUNT OP_NUMEQUALVERIFY OP_9 OP_ROLL OP_SHA256 OP_6 OP_ROLL OP_EQUALVERIFY OP_7 OP_ROLL OP_IF 76a914 OP_6 OP_PICK OP_CAT 88ac OP_CAT OP_1 OP_OUTPUTBYTECODE OP_OVER OP_EQUALVERIFY OP_1 OP_OUTPUTVALUE OP_0 OP_UTXOVALUE OP_NUMEQUALVERIFY OP_DROP OP_ELSE OP_TXLOCKTIME OP_OVER OP_GREATERTHANOREQUAL OP_VERIFY OP_ENDIF OP_2DROP OP_2DROP OP_2DROP OP_DROP OP_1 OP_ELSE OP_8 OP_ROLL OP_2 OP_NUMEQUALVERIFY OP_TXVERSION OP_2 OP_NUMEQUALVERIFY OP_INPUTINDEX OP_0 OP_NUMEQUALVERIFY OP_TXLOCKTIME OP_ROT OP_GREATERTHANOREQUAL OP_VERIFY 76a914 OP_6 OP_ROLL OP_CAT 88ac OP_CAT OP_0 OP_OUTPUTBYTECODE OP_EQUALVERIFY OP_0 OP_OUTPUTTOKENCATEGORY OP_0 OP_UTXOTOKENCATEGORY OP_EQUALVERIFY OP_0 OP_OUTPUTTOKENAMOUNT OP_0 OP_UTXOTOKENAMOUNT OP_NUMEQUALVERIFY OP_0 OP_OUTPUTVALUE OP_0 OP_UTXOVALUE OP_NUMEQUALVERIFY OP_2DROP OP_2DROP OP_2DROP OP_1 OP_ENDIF OP_ENDIF',
  source: 'pragma cashscript ~0.11.0;\n\ncontract EscrowDst(\n  // time when other resolver can unlock\n  int publicUnlockTimestamp,\n  // time when resolver can cancel\n  int resolverCancellTimestamp,\n\n  int amount,\n  bytes32 token,\n  int safetyDeposit,\n\n  bytes32 hashlock,\n  bytes20 resolverPubkHash,\n  bytes20 makerPubkHash\n) {\n  function fundSafetyDepositAndToken() {\n    require(tx.version == 2, "Invalid version");\n    require(this.activeInputIndex == 0, "Invalid input index");\n\n    // ensure that all tokens are sent to resolver\n    require(tx.outputs[0].lockingBytecode == tx.inputs[0].lockingBytecode, "Invalid output destination");\n    require(tx.outputs[0].tokenCategory == token, "Invalid output category");\n    require(tx.outputs[0].tokenAmount == amount, "Invalid output token");\n    require(tx.outputs[0].value == safetyDeposit, "Invalid value sats");\n  }\n\n  function unlock(bool isResolver, bytes32 secret) {\n    require(tx.version == 2, "Invalid version");\n    require(this.activeInputIndex == 0, "Invalid input index");\n\n    // ensure that all tokens are sent to maker\n    bytes makerLockingBytecode = new LockingBytecodeP2PKH(makerPubkHash);\n    require(tx.outputs[0].lockingBytecode == makerLockingBytecode, "Invalid output destination");\n    require(tx.outputs[0].tokenCategory == tx.inputs[0].tokenCategory, "Invalid output category");\n    require(tx.outputs[0].tokenAmount == tx.inputs[0].tokenAmount, "Invalid output token");\n\n    // ensure that secret is revealed\n    require(sha256(secret) == hashlock, "Invalid secret");\n\n    if(isResolver) {\n      // ensure that collateral is sent to resolver\n      bytes resolverLockingBytecode = new LockingBytecodeP2PKH(resolverPubkHash);\n      require(tx.outputs[1].lockingBytecode == resolverLockingBytecode, "Invalid output1 destination");\n      require(tx.outputs[1].value == tx.inputs[0].value, "Invalid output1 collateral");\n    } else {\n      // ensure public unlock time met, \n      //   then they can sent the collateral to anyone using output 1\n      require(tx.locktime >= publicUnlockTimestamp, "Invalid locktime for public unlock");\n    }\n  }\n\n  function cancel() {\n    require(tx.version == 2, "Invalid version");\n    require(this.activeInputIndex == 0, "Invalid input index");\n    require(tx.locktime >= resolverCancellTimestamp, "Invalid locktime for resolver cancel");\n\n    // ensure that all tokens are sent to resolver\n    bytes resolverLockingBytecode = new LockingBytecodeP2PKH(resolverPubkHash);\n    require(tx.outputs[0].lockingBytecode == resolverLockingBytecode, "Invalid output destination");\n    require(tx.outputs[0].tokenCategory == tx.inputs[0].tokenCategory, "Invalid output token category");\n    require(tx.outputs[0].tokenAmount == tx.inputs[0].tokenAmount, "Invalid output token");\n    require(tx.outputs[0].value == tx.inputs[0].value, "Invalid output collateral");\n  }\n}\n',
  debug: {
    bytecode: '5879009c63c2529dc0009d00cd00c78800d1547a8800d3537a9d00cc537a9d6d6d6d51675879519c63c2529dc0009d0376a914587a7e0288ac7e00cd8800d100ce8800d300d09d597aa8567a88577a630376a91456797e0288ac7e51cd788851cc00c69d7567c578a269686d6d6d755167587a529dc2529dc0009dc57ba2690376a914567a7e0288ac7e00cd8800d100ce8800d300d09d00cc00c69d6d6d6d516868',
    sourceMap: '17:2:26:3;;;;;18:12:18:22;:26::27;:4::48:1;19:12:19:33:0;:37::38;:4::63:1;22:23:22:24:0;:12::41:1;:55::56:0;:45::73:1;:4::105;23:23:23:24:0;:12::39:1;:43::48:0;;:4::77:1;24:23:24:24:0;:12::37:1;:41::47:0;;:4::73:1;25:23:25:24:0;:12::31:1;:35::48:0;;:4::72:1;17:2:26:3;;;;;28::51::0;;;;;29:12:29:22;:26::27;:4::48:1;30:12:30:33:0;:37::38;:4::63:1;33:33:33:72:0;:58::71;;:33::72:1;;;34:23:34:24:0;:12::41:1;:4::97;35:23:35:24:0;:12::39:1;:53::54:0;:43::69:1;:4::98;36:23:36:24:0;:12::37:1;:51::52:0;:41::65:1;:4::91;39:19:39:25:0;;:12::26:1;:30::38:0;;:4::58:1;41:7:41:17:0;;:19:46:5;43:38:43:80;:63::79;;:38::80:1;;;44:25:44:26:0;:14::43:1;:47::70:0;:6::103:1;45:25:45:26:0;:14::33:1;:47::48:0;:37::55:1;:6::87;41:19:46:5;46:11:50::0;49:14:49:25;:29::50;:14:::1;:6::90;46:11:50:5;28:2:51:3;;;;;;53::64::0;;;;54:12:54:22;:26::27;:4::48:1;55:12:55:33:0;:37::38;:4::63:1;56:12:56:23:0;:27::51;:12:::1;:4::93;59:36:59:78:0;:61::77;;:36::78:1;;;60:23:60:24:0;:12::41:1;:4::100;61:23:61:24:0;:12::39:1;:53::54:0;:43::69:1;:4::104;62:23:62:24:0;:12::37:1;:51::52:0;:41::65:1;:4::91;63:23:63:24:0;:12::31:1;:45::46:0;:35::53:1;:4::84;53:2:64:3;;;;3:0:65:1;',
    logs: [],
    requires: [
      {
        ip: 15,
        line: 18,
        message: 'Invalid version',
      },
      {
        ip: 18,
        line: 19,
        message: 'Invalid input index',
      },
      {
        ip: 23,
        line: 22,
        message: 'Invalid output destination',
      },
      {
        ip: 28,
        line: 23,
        message: 'Invalid output category',
      },
      {
        ip: 33,
        line: 24,
        message: 'Invalid output token',
      },
      {
        ip: 38,
        line: 25,
        message: 'Invalid value sats',
      },
      {
        ip: 51,
        line: 29,
        message: 'Invalid version',
      },
      {
        ip: 54,
        line: 30,
        message: 'Invalid input index',
      },
      {
        ip: 63,
        line: 34,
        message: 'Invalid output destination',
      },
      {
        ip: 68,
        line: 35,
        message: 'Invalid output category',
      },
      {
        ip: 73,
        line: 36,
        message: 'Invalid output token',
      },
      {
        ip: 79,
        line: 39,
        message: 'Invalid secret',
      },
      {
        ip: 92,
        line: 44,
        message: 'Invalid output1 destination',
      },
      {
        ip: 97,
        line: 45,
        message: 'Invalid output1 collateral',
      },
      {
        ip: 103,
        line: 49,
        message: 'Invalid locktime for public unlock',
      },
      {
        ip: 117,
        line: 54,
        message: 'Invalid version',
      },
      {
        ip: 120,
        line: 55,
        message: 'Invalid input index',
      },
      {
        ip: 124,
        line: 56,
        message: 'Invalid locktime for resolver cancel',
      },
      {
        ip: 133,
        line: 60,
        message: 'Invalid output destination',
      },
      {
        ip: 138,
        line: 61,
        message: 'Invalid output token category',
      },
      {
        ip: 143,
        line: 62,
        message: 'Invalid output token',
      },
      {
        ip: 148,
        line: 63,
        message: 'Invalid output collateral',
      },
    ],
  },
  compiler: {
    name: 'cashc',
    version: '0.11.3',
  },
  updatedAt: '2025-07-31T12:45:44.492Z',
} as const;
