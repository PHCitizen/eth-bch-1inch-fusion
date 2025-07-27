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
      inputs: [],
    },
  ],
  bytecode: 'OP_5 OP_PICK OP_0 OP_NUMEQUAL OP_IF OP_TXVERSION OP_2 OP_NUMEQUALVERIFY OP_INPUTINDEX OP_0 OP_NUMEQUALVERIFY OP_0 OP_OUTPUTBYTECODE OP_5 OP_ROLL OP_EQUALVERIFY OP_0 OP_OUTPUTTOKENCATEGORY OP_0 OP_UTXOTOKENCATEGORY OP_EQUALVERIFY OP_0 OP_OUTPUTTOKENAMOUNT OP_0 OP_UTXOTOKENAMOUNT OP_NUMEQUALVERIFY OP_6 OP_ROLL OP_SHA256 OP_3 OP_ROLL OP_EQUALVERIFY OP_4 OP_ROLL OP_IF OP_1 OP_OUTPUTBYTECODE OP_3 OP_PICK OP_EQUALVERIFY OP_1 OP_OUTPUTVALUE OP_0 OP_UTXOVALUE OP_NUMEQUALVERIFY OP_ELSE OP_TXLOCKTIME OP_OVER OP_GREATERTHANOREQUAL OP_VERIFY OP_ENDIF OP_2DROP OP_2DROP OP_1 OP_ELSE OP_5 OP_ROLL OP_1 OP_NUMEQUALVERIFY OP_TXVERSION OP_2 OP_NUMEQUALVERIFY OP_INPUTINDEX OP_0 OP_NUMEQUALVERIFY OP_TXLOCKTIME OP_ROT OP_GREATERTHANOREQUAL OP_VERIFY OP_0 OP_OUTPUTBYTECODE OP_3 OP_ROLL OP_EQUALVERIFY OP_0 OP_OUTPUTTOKENCATEGORY OP_0 OP_UTXOTOKENCATEGORY OP_EQUALVERIFY OP_0 OP_OUTPUTTOKENAMOUNT OP_0 OP_UTXOTOKENAMOUNT OP_NUMEQUALVERIFY OP_0 OP_OUTPUTVALUE OP_0 OP_UTXOVALUE OP_NUMEQUAL OP_NIP OP_NIP OP_NIP OP_ENDIF',
  source: 'pragma cashscript ~0.11.0;\n\ncontract EscrowDst(\n  int publicUnlockTimestamp,\n  int resolverCancellTimestamp,\n\n  bytes32 hashlock,\n  bytes resolverLockingBytecode,\n  bytes makerLockingBytecode\n) {\n  function unlock(bool isResolver, bytes32 secret) {\n    require(tx.version == 2, "Invalid version");\n    require(this.activeInputIndex == 0, "Invalid input index");\n\n    // ensure that all tokens are sent to maker\n    require(tx.outputs[0].lockingBytecode == makerLockingBytecode, "Invalid output destination");\n    require(tx.outputs[0].tokenCategory == tx.inputs[0].tokenCategory, "Invalid output category");\n    require(tx.outputs[0].tokenAmount == tx.inputs[0].tokenAmount, "Invalid output token");\n\n    // ensure that secret is revealed\n    require(sha256(secret) == hashlock, "Invalid secret");\n\n    if(isResolver) {\n      // ensure that collateral is sent to resolver\n      require(tx.outputs[1].lockingBytecode == resolverLockingBytecode, "Invalid output1 destination");\n      require(tx.outputs[1].value == tx.inputs[0].value, "Invalid output1 collateral");\n    } else {\n      // ensure public unlock time met, \n      //   then they can sent the collateral to anyone using output 1\n      require(tx.locktime >= publicUnlockTimestamp, "Invalid locktime for public unlock");\n    }\n  }\n\n  function cancel() {\n    require(tx.version == 2, "Invalid version");\n    require(this.activeInputIndex == 0, "Invalid input index");\n    require(tx.locktime >= resolverCancellTimestamp, "Invalid locktime for resolver cancel");\n\n    // ensure that all tokens are sent to resolver\n    require(tx.outputs[0].lockingBytecode == resolverLockingBytecode, "Invalid output destination");\n    require(tx.outputs[0].tokenCategory == tx.inputs[0].tokenCategory, "Invalid output token category");\n    require(tx.outputs[0].tokenAmount == tx.inputs[0].tokenAmount, "Invalid output token");\n    require(tx.outputs[0].value == tx.inputs[0].value, "Invalid output collateral");\n  }\n}\n',
  debug: {
    bytecode: '5579009c63c2529dc0009d00cd557a8800d100ce8800d300d09d567aa8537a88547a6351cd53798851cc00c69d67c578a269686d6d5167557a519dc2529dc0009dc57ba26900cd537a8800d100ce8800d300d09d00cc00c69c77777768',
    sourceMap: '11:2:32:3;;;;;12:12:12:22;:26::27;:4::48:1;13:12:13:33:0;:37::38;:4::63:1;16:23:16:24:0;:12::41:1;:45::65:0;;:4::97:1;17:23:17:24:0;:12::39:1;:53::54:0;:43::69:1;:4::98;18:23:18:24:0;:12::37:1;:51::52:0;:41::65:1;:4::91;21:19:21:25:0;;:12::26:1;:30::38:0;;:4::58:1;23:7:23:17:0;;:19:27:5;25:25:25:26;:14::43:1;:47::70:0;;:6::103:1;26:25:26:26:0;:14::33:1;:47::48:0;:37::55:1;:6::87;27:11:31:5:0;30:14:30:25;:29::50;:14:::1;:6::90;27:11:31:5;11:2:32:3;;;;34::44::0;;;;35:12:35:22;:26::27;:4::48:1;36:12:36:33:0;:37::38;:4::63:1;37:12:37:23:0;:27::51;:12:::1;:4::93;40:23:40:24:0;:12::41:1;:45::68:0;;:4::100:1;41:23:41:24:0;:12::39:1;:53::54:0;:43::69:1;:4::104;42:23:42:24:0;:12::37:1;:51::52:0;:41::65:1;:4::91;43:23:43:24:0;:12::31:1;:45::46:0;:35::53:1;:4::84;34:2:44:3;;;3:0:45:1',
    logs: [],
    requires: [
      {
        ip: 12,
        line: 12,
        message: 'Invalid version',
      },
      {
        ip: 15,
        line: 13,
        message: 'Invalid input index',
      },
      {
        ip: 20,
        line: 16,
        message: 'Invalid output destination',
      },
      {
        ip: 25,
        line: 17,
        message: 'Invalid output category',
      },
      {
        ip: 30,
        line: 18,
        message: 'Invalid output token',
      },
      {
        ip: 36,
        line: 21,
        message: 'Invalid secret',
      },
      {
        ip: 44,
        line: 25,
        message: 'Invalid output1 destination',
      },
      {
        ip: 49,
        line: 26,
        message: 'Invalid output1 collateral',
      },
      {
        ip: 54,
        line: 30,
        message: 'Invalid locktime for public unlock',
      },
      {
        ip: 66,
        line: 35,
        message: 'Invalid version',
      },
      {
        ip: 69,
        line: 36,
        message: 'Invalid input index',
      },
      {
        ip: 73,
        line: 37,
        message: 'Invalid locktime for resolver cancel',
      },
      {
        ip: 78,
        line: 40,
        message: 'Invalid output destination',
      },
      {
        ip: 83,
        line: 41,
        message: 'Invalid output token category',
      },
      {
        ip: 88,
        line: 42,
        message: 'Invalid output token',
      },
      {
        ip: 94,
        line: 43,
        message: 'Invalid output collateral',
      },
    ],
  },
  compiler: {
    name: 'cashc',
    version: '0.11.3',
  },
  updatedAt: '2025-07-27T05:23:31.804Z',
} as const;
