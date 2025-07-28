// @ts-nocheck
import { setup, fromCallback } from "xstate";

export const MakerMachine = setup({
  types: {
    context: {} as {},
    events: {} as
      | { type: "cancel order" }
      | { type: "create order" }
      | { type: "FundEscrowSrc" }
      | { type: "Reveal Secret" }
      | { type: "PublicWithdraw" }
      | { type: "EscrowDst Funded" }
      | { type: "escrowSrc created" }
      | { type: "withdraw" }
      | { type: "cancel" }
      | { type: "publicCancel" },
  },
  actions: {
    createOrder: function ({ context, event }, params) {
      // Add your action code here
      // ...
    },
    cancelOrder: function ({ context, event }, params) {
      // Add your action code here
      // ...
    },
    fundEscrowSrc: function ({ context, event }, params) {
      // Add your action code here
      // ...
    },
    revealSecret: function ({ context, event }, params) {
      // Add your action code here
      // ...
    },
    publicWithdraw: function ({ context, event }, params) {
      // Add your action code here
      // ...
    },
    publicCancel: function ({ context, event }, params) {
      // Add your action code here
      // ...
    },
  },
  actors: {
    watchEscrowSrcDeploy: fromCallback(({ sendBack, receive }) => {
      // ...

      return () => {
        // cleanup
      };
    }),
    watchEscrowDstDeployAndFund: fromCallback(({ sendBack, receive }) => {
      // ...

      return () => {
        // cleanup
      };
    }),
    watchCancel: fromCallback(({ sendBack, receive }) => {
      // ...

      return () => {
        // cleanup
      };
    }),
    watchWithdraw: fromCallback(({ sendBack, receive }) => {
      // ...

      return () => {
        // cleanup
      };
    }),
  },
  guards: {
    ValidEscrowSrc: function ({ context, event }) {
      // Add your guard condition here
      return true;
    },
    ValidEscrowDst: function ({ context, event }) {
      // Add your guard condition here
      return true;
    },
  },
}).createMachine({
  context: {},
  id: "MakerMachine",
  initial: "start",
  states: {
    start: {
      on: {
        "create order": {
          target: "Order Created",
          actions: {
            type: "createOrder",
          },
        },
      },
    },
    "Order Created": {
      on: {
        "cancel order": {
          target: "finish",
          actions: {
            type: "cancelOrder",
          },
          meta: {
            user_action: true,
          },
        },
        "escrowSrc created": [
          {
            target: "EscrowSrcCreated",
            guard: {
              type: "ValidEscrowSrc",
            },
          },
          {
            target: "Order Created",
          },
        ],
      },
      invoke: {
        input: {},
        src: "watchEscrowSrcDeploy",
      },
    },
    finish: {},
    EscrowSrcCreated: {
      on: {
        FundEscrowSrc: {
          target: "EscrowSrcFunded",
          actions: {
            type: "fundEscrowSrc",
          },
          meta: {
            user_action: true,
          },
        },
      },
    },
    EscrowSrcFunded: {
      on: {
        "EscrowDst Funded": [
          {
            target: "EscrowDstFunded",
            guard: {
              type: "ValidEscrowDst",
            },
          },
          {
            target: "Resolver Cancel",
          },
        ],
      },
      invoke: {
        input: {},
        src: "watchEscrowDstDeployAndFund",
      },
    },
    EscrowDstFunded: {
      on: {
        "Reveal Secret": {
          target: "ResolverWithdraw",
          actions: {
            type: "revealSecret",
          },
          meta: {
            user_action: true,
          },
        },
      },
    },
    "Resolver Cancel": {
      on: {
        cancel: {
          target: "finish",
        },
      },
      after: {
        "5000": {
          target: "Public Cancel",
        },
      },
      invoke: {
        input: {},
        src: "watchCancel",
      },
    },
    ResolverWithdraw: {
      on: {
        withdraw: {
          target: "finish",
        },
      },
      after: {
        "5000": {
          target: "PublicWithdraw",
        },
      },
      invoke: {
        input: {},
        src: "watchWithdraw",
      },
    },
    "Public Cancel": {
      on: {
        cancel: {
          target: "finish",
        },
        publicCancel: {
          target: "finish",
          actions: {
            type: "publicCancel",
          },
          meta: {
            user_action: true,
          },
        },
      },
      invoke: {
        input: {},
        src: "watchCancel",
      },
    },
    PublicWithdraw: {
      on: {
        withdraw: {
          target: "finish",
        },
        PublicWithdraw: {
          target: "finish",
          actions: {
            type: "publicWithdraw",
          },
        },
      },
      after: {
        "5000": {
          target: "Resolver Cancel",
        },
      },
      invoke: {
        input: {},
        src: "watchWithdraw",
      },
    },
  },
});
