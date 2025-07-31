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
  bytecode: 'OP_5 OP_PICK OP_0 OP_NUMEQUAL OP_IF OP_TXVERSION OP_2 OP_NUMEQUALVERIFY OP_INPUTINDEX OP_0 OP_NUMEQUALVERIFY 76a914 OP_5 OP_ROLL OP_CAT 88ac OP_CAT OP_0 OP_OUTPUTBYTECODE OP_EQUALVERIFY OP_0 OP_OUTPUTTOKENCATEGORY OP_0 OP_UTXOTOKENCATEGORY OP_EQUALVERIFY OP_0 OP_OUTPUTTOKENAMOUNT OP_0 OP_UTXOTOKENAMOUNT OP_NUMEQUALVERIFY OP_6 OP_ROLL OP_SHA256 OP_3 OP_ROLL OP_EQUALVERIFY OP_4 OP_ROLL OP_IF 76a914 OP_3 OP_PICK OP_CAT 88ac OP_CAT OP_1 OP_OUTPUTBYTECODE OP_OVER OP_EQUALVERIFY OP_1 OP_OUTPUTVALUE OP_0 OP_UTXOVALUE OP_NUMEQUALVERIFY OP_DROP OP_ELSE OP_TXLOCKTIME OP_OVER OP_GREATERTHANOREQUAL OP_VERIFY OP_ENDIF OP_2DROP OP_2DROP OP_1 OP_ELSE OP_5 OP_ROLL OP_1 OP_NUMEQUALVERIFY OP_TXVERSION OP_2 OP_NUMEQUALVERIFY OP_INPUTINDEX OP_0 OP_NUMEQUALVERIFY OP_TXLOCKTIME OP_ROT OP_GREATERTHANOREQUAL OP_VERIFY 76a914 OP_3 OP_ROLL OP_CAT 88ac OP_CAT OP_0 OP_OUTPUTBYTECODE OP_EQUALVERIFY OP_0 OP_OUTPUTTOKENCATEGORY OP_0 OP_UTXOTOKENCATEGORY OP_EQUALVERIFY OP_0 OP_OUTPUTTOKENAMOUNT OP_0 OP_UTXOTOKENAMOUNT OP_NUMEQUALVERIFY OP_0 OP_OUTPUTVALUE OP_0 OP_UTXOVALUE OP_NUMEQUAL OP_NIP OP_NIP OP_NIP OP_ENDIF',
  source: 'pragma cashscript ~0.11.0;\n\ncontract EscrowDst(\n  // time when other resolver can unlock\n  int publicUnlockTimestamp,\n  // time when resolver can cancel\n  int resolverCancellTimestamp,\n\n  bytes32 hashlock,\n  bytes20 resolverPubkHash,\n  bytes20 makerPubkHash\n) {\n  function unlock(bool isResolver, bytes32 secret) {\n    require(tx.version == 2, "Invalid version");\n    require(this.activeInputIndex == 0, "Invalid input index");\n\n    // ensure that all tokens are sent to maker\n    bytes makerLockingBytecode = new LockingBytecodeP2PKH(makerPubkHash);\n    require(tx.outputs[0].lockingBytecode == makerLockingBytecode, "Invalid output destination");\n    require(tx.outputs[0].tokenCategory == tx.inputs[0].tokenCategory, "Invalid output category");\n    require(tx.outputs[0].tokenAmount == tx.inputs[0].tokenAmount, "Invalid output token");\n\n    // ensure that secret is revealed\n    require(sha256(secret) == hashlock, "Invalid secret");\n\n    if(isResolver) {\n      // ensure that collateral is sent to resolver\n      bytes resolverLockingBytecode = new LockingBytecodeP2PKH(resolverPubkHash);\n      require(tx.outputs[1].lockingBytecode == resolverLockingBytecode, "Invalid output1 destination");\n      require(tx.outputs[1].value == tx.inputs[0].value, "Invalid output1 collateral");\n    } else {\n      // ensure public unlock time met, \n      //   then they can sent the collateral to anyone using output 1\n      require(tx.locktime >= publicUnlockTimestamp, "Invalid locktime for public unlock");\n    }\n  }\n\n  function cancel() {\n    require(tx.version == 2, "Invalid version");\n    require(this.activeInputIndex == 0, "Invalid input index");\n    require(tx.locktime >= resolverCancellTimestamp, "Invalid locktime for resolver cancel");\n\n    // ensure that all tokens are sent to resolver\n    bytes resolverLockingBytecode = new LockingBytecodeP2PKH(resolverPubkHash);\n    require(tx.outputs[0].lockingBytecode == resolverLockingBytecode, "Invalid output destination");\n    require(tx.outputs[0].tokenCategory == tx.inputs[0].tokenCategory, "Invalid output token category");\n    require(tx.outputs[0].tokenAmount == tx.inputs[0].tokenAmount, "Invalid output token");\n    require(tx.outputs[0].value == tx.inputs[0].value, "Invalid output collateral");\n  }\n}\n',
  debug: {
    bytecode: '5579009c63c2529dc0009d0376a914557a7e0288ac7e00cd8800d100ce8800d300d09d567aa8537a88547a630376a91453797e0288ac7e51cd788851cc00c69d7567c578a269686d6d5167557a519dc2529dc0009dc57ba2690376a914537a7e0288ac7e00cd8800d100ce8800d300d09d00cc00c69c77777768',
    sourceMap: '13:2:36:3;;;;;14:12:14:22;:26::27;:4::48:1;15:12:15:33:0;:37::38;:4::63:1;18:33:18:72:0;:58::71;;:33::72:1;;;19:23:19:24:0;:12::41:1;:4::97;20:23:20:24:0;:12::39:1;:53::54:0;:43::69:1;:4::98;21:23:21:24:0;:12::37:1;:51::52:0;:41::65:1;:4::91;24:19:24:25:0;;:12::26:1;:30::38:0;;:4::58:1;26:7:26:17:0;;:19:31:5;28:38:28:80;:63::79;;:38::80:1;;;29:25:29:26:0;:14::43:1;:47::70:0;:6::103:1;30:25:30:26:0;:14::33:1;:47::48:0;:37::55:1;:6::87;26:19:31:5;31:11:35::0;34:14:34:25;:29::50;:14:::1;:6::90;31:11:35:5;13:2:36:3;;;;38::49::0;;;;39:12:39:22;:26::27;:4::48:1;40:12:40:33:0;:37::38;:4::63:1;41:12:41:23:0;:27::51;:12:::1;:4::93;44:36:44:78:0;:61::77;;:36::78:1;;;45:23:45:24:0;:12::41:1;:4::100;46:23:46:24:0;:12::39:1;:53::54:0;:43::69:1;:4::104;47:23:47:24:0;:12::37:1;:51::52:0;:41::65:1;:4::91;48:23:48:24:0;:12::31:1;:45::46:0;:35::53:1;:4::84;38:2:49:3;;;3:0:50:1',
    logs: [],
    requires: [
      {
        ip: 12,
        line: 14,
        message: 'Invalid version',
      },
      {
        ip: 15,
        line: 15,
        message: 'Invalid input index',
      },
      {
        ip: 24,
        line: 19,
        message: 'Invalid output destination',
      },
      {
        ip: 29,
        line: 20,
        message: 'Invalid output category',
      },
      {
        ip: 34,
        line: 21,
        message: 'Invalid output token',
      },
      {
        ip: 40,
        line: 24,
        message: 'Invalid secret',
      },
      {
        ip: 53,
        line: 29,
        message: 'Invalid output1 destination',
      },
      {
        ip: 58,
        line: 30,
        message: 'Invalid output1 collateral',
      },
      {
        ip: 64,
        line: 34,
        message: 'Invalid locktime for public unlock',
      },
      {
        ip: 76,
        line: 39,
        message: 'Invalid version',
      },
      {
        ip: 79,
        line: 40,
        message: 'Invalid input index',
      },
      {
        ip: 83,
        line: 41,
        message: 'Invalid locktime for resolver cancel',
      },
      {
        ip: 92,
        line: 45,
        message: 'Invalid output destination',
      },
      {
        ip: 97,
        line: 46,
        message: 'Invalid output token category',
      },
      {
        ip: 102,
        line: 47,
        message: 'Invalid output token',
      },
      {
        ip: 108,
        line: 48,
        message: 'Invalid output collateral',
      },
    ],
  },
  compiler: {
    name: 'cashc',
    version: '0.11.3',
  },
  updatedAt: '2025-07-31T03:04:36.836Z',
} as const;
