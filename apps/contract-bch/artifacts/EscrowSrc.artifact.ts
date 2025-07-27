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
      name: 'hashlock',
      type: 'bytes32',
    },
    {
      name: 'resolverLockingBytecode',
      type: 'bytes',
    },
    {
      name: 'makerLockingBytecode',
      type: 'bytes',
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
      inputs: [
        {
          name: 'isResolver',
          type: 'bool',
        },
      ],
    },
  ],
  bytecode: 'OP_6 OP_PICK OP_0 OP_NUMEQUAL OP_IF OP_TXVERSION OP_2 OP_NUMEQUALVERIFY OP_INPUTINDEX OP_0 OP_NUMEQUALVERIFY OP_0 OP_OUTPUTBYTECODE OP_5 OP_ROLL OP_EQUALVERIFY OP_0 OP_OUTPUTTOKENCATEGORY OP_0 OP_UTXOTOKENCATEGORY OP_EQUALVERIFY OP_0 OP_OUTPUTTOKENAMOUNT OP_0 OP_UTXOTOKENAMOUNT OP_NUMEQUALVERIFY OP_7 OP_ROLL OP_SHA256 OP_4 OP_ROLL OP_EQUALVERIFY OP_5 OP_ROLL OP_IF OP_0 OP_OUTPUTVALUE OP_0 OP_UTXOVALUE OP_NUMEQUALVERIFY OP_ELSE OP_TXLOCKTIME OP_OVER OP_GREATERTHANOREQUAL OP_VERIFY OP_ENDIF OP_2DROP OP_2DROP OP_DROP OP_1 OP_ELSE OP_6 OP_ROLL OP_1 OP_NUMEQUALVERIFY OP_TXVERSION OP_2 OP_NUMEQUALVERIFY OP_INPUTINDEX OP_0 OP_NUMEQUALVERIFY OP_0 OP_OUTPUTBYTECODE OP_6 OP_ROLL OP_EQUALVERIFY OP_0 OP_OUTPUTTOKENCATEGORY OP_0 OP_UTXOTOKENCATEGORY OP_EQUALVERIFY OP_0 OP_UTXOTOKENAMOUNT OP_0 OP_OUTPUTTOKENAMOUNT OP_NUMEQUALVERIFY OP_5 OP_ROLL OP_IF OP_TXLOCKTIME OP_2 OP_PICK OP_GREATERTHANOREQUAL OP_VERIFY OP_1 OP_OUTPUTBYTECODE OP_5 OP_PICK OP_EQUALVERIFY OP_1 OP_OUTPUTVALUE OP_0 OP_UTXOVALUE OP_NUMEQUALVERIFY OP_ELSE OP_TXLOCKTIME OP_3 OP_PICK OP_GREATERTHANOREQUAL OP_VERIFY OP_ENDIF OP_2DROP OP_2DROP OP_DROP OP_1 OP_ENDIF',
  source: 'pragma cashscript ~0.11.0;\n\ncontract EscrowSrc(\n  int publicUnlockTimestamp,\n  int resolverCancellTimestamp,\n  int publicCancelTimestamp,\n\n  bytes32 hashlock,\n  bytes resolverLockingBytecode,\n  bytes makerLockingBytecode\n) {\n  function unlock(bool isResolver, bytes32 secret) {\n    require(tx.version == 2, "Invalid version");\n    require(this.activeInputIndex == 0, "Invalid input index");\n\n    // ensure that all tokens are sent to resolver\n    require(tx.outputs[0].lockingBytecode == resolverLockingBytecode, "Invalid output destination");\n    require(tx.outputs[0].tokenCategory == tx.inputs[0].tokenCategory , "Invalid output category");\n    require(tx.outputs[0].tokenAmount == tx.inputs[0].tokenAmount , "Invalid output token");\n\n    // ensure that secret is revealed\n    require(sha256(secret) == hashlock, "Invalid secret");\n\n    if(isResolver) {\n      // ensure that collateral is sent to resolver\n      require(tx.outputs[0].value == tx.inputs[0].value, "Invalid output collateral");\n    } else {\n      // ensure public unlock time met, \n      //   then they can sent the collateral to anyone using output 1\n      require(tx.locktime >= publicUnlockTimestamp, "Invalid locktime for public unlock");\n    }\n  }\n\n  function cancel(bool isResolver) {\n    require(tx.version == 2, "Invalid version");\n    require(this.activeInputIndex == 0, "Invalid input index");\n\n    // ensure that all tokens are sent to maker\n    require(tx.outputs[0].lockingBytecode == makerLockingBytecode, "Invalid output. Must be the maker");\n    require(tx.outputs[0].tokenCategory == tx.inputs[0].tokenCategory , "Invalid output category");\n    require(tx.inputs[0].tokenAmount == tx.outputs[0].tokenAmount, "Invalid output token");\n\n    if(isResolver) {\n      require(tx.locktime >= resolverCancellTimestamp, "Invalid locktime for resolver cancel");\n\n      // ensure that collateral is sent to resolver\n      require(tx.outputs[1].lockingBytecode == resolverLockingBytecode, "Invalid output1 destination");\n      require(tx.outputs[1].value == tx.inputs[0].value, "Invalid output1 collateral");\n    } else {\n      // ensure puvlic cancel time met, \n      //   then they can sent the collateral to anyone using output 1\n      require(tx.locktime >= publicCancelTimestamp, "Invalid locktime for public cancel");\n    }\n  }\n}\n',
  debug: {
    bytecode: '5679009c63c2529dc0009d00cd557a8800d100ce8800d300d09d577aa8547a88557a6300cc00c69d67c578a269686d6d755167567a519dc2529dc0009d00cd567a8800d100ce8800d000d39d557a63c55279a26951cd55798851cc00c69d67c55379a269686d6d755168',
    sourceMap: '12:2:32:3;;;;;13:12:13:22;:26::27;:4::48:1;14:12:14:33:0;:37::38;:4::63:1;17:23:17:24:0;:12::41:1;:45::68:0;;:4::100:1;18:23:18:24:0;:12::39:1;:53::54:0;:43::69:1;:4::99;19:23:19:24:0;:12::37:1;:51::52:0;:41::65:1;:4::92;22:19:22:25:0;;:12::26:1;:30::38:0;;:4::58:1;24:7:24:17:0;;:19:27:5;26:25:26:26;:14::33:1;:47::48:0;:37::55:1;:6::86;27:11:31:5:0;30:14:30:25;:29::50;:14:::1;:6::90;27:11:31:5;12:2:32:3;;;;;34::54::0;;;;35:12:35:22;:26::27;:4::48:1;36:12:36:33:0;:37::38;:4::63:1;39:23:39:24:0;:12::41:1;:45::65:0;;:4::104:1;40:23:40:24:0;:12::39:1;:53::54:0;:43::69:1;:4::99;41:22:41:23:0;:12::36:1;:51::52:0;:40::65:1;:4::91;43:7:43:17:0;;:19:49:5;44:14:44:25;:29::53;;:14:::1;:6::95;47:25:47:26:0;:14::43:1;:47::70:0;;:6::103:1;48:25:48:26:0;:14::33:1;:47::48:0;:37::55:1;:6::87;49:11:53:5:0;52:14:52:25;:29::50;;:14:::1;:6::90;49:11:53:5;34:2:54:3;;;;3:0:55:1',
    logs: [],
    requires: [
      {
        ip: 13,
        line: 13,
        message: 'Invalid version',
      },
      {
        ip: 16,
        line: 14,
        message: 'Invalid input index',
      },
      {
        ip: 21,
        line: 17,
        message: 'Invalid output destination',
      },
      {
        ip: 26,
        line: 18,
        message: 'Invalid output category',
      },
      {
        ip: 31,
        line: 19,
        message: 'Invalid output token',
      },
      {
        ip: 37,
        line: 22,
        message: 'Invalid secret',
      },
      {
        ip: 45,
        line: 26,
        message: 'Invalid output collateral',
      },
      {
        ip: 50,
        line: 30,
        message: 'Invalid locktime for public unlock',
      },
      {
        ip: 63,
        line: 35,
        message: 'Invalid version',
      },
      {
        ip: 66,
        line: 36,
        message: 'Invalid input index',
      },
      {
        ip: 71,
        line: 39,
        message: 'Invalid output. Must be the maker',
      },
      {
        ip: 76,
        line: 40,
        message: 'Invalid output category',
      },
      {
        ip: 81,
        line: 41,
        message: 'Invalid output token',
      },
      {
        ip: 89,
        line: 44,
        message: 'Invalid locktime for resolver cancel',
      },
      {
        ip: 94,
        line: 47,
        message: 'Invalid output1 destination',
      },
      {
        ip: 99,
        line: 48,
        message: 'Invalid output1 collateral',
      },
      {
        ip: 105,
        line: 52,
        message: 'Invalid locktime for public cancel',
      },
    ],
  },
  compiler: {
    name: 'cashc',
    version: '0.11.3',
  },
  updatedAt: '2025-07-27T05:23:32.427Z',
} as const;
