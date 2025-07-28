// @ts-nocheck
import { setup, fromCallback } from "xstate";

export const ResolverMachine = setup({
  types: {
    context: {} as {},
    events: {} as
      | { type: "ResolverCancel" }
      | { type: "ResolverWithdraw" }
      | { type: "makerFundEscrowSrc" }
      | { type: "deployEscrowDst" }
      | { type: "Secret Revealed" }
      | { type: "deploySrcEscrow" }
      | { type: "withdraw" }
      | { type: "cancel" },
  },
  actions: {
    withdraw: function ({ context, event }, params) {
      // Add your action code here
      // ...
    },
    cancel: function ({ context, event }, params) {
      // Add your action code here
      // ...
    },
    deploySrcEscrow: function ({ context, event }, params) {
      // Add your action code here
      // ...
    },
    deployDstEscrow: function ({ context, event }, params) {
      // Add your action code here
      // ...
    },
  },
  actors: {
    watchEscrowSrcFunding: fromCallback(({ sendBack, receive }) => {
      // ...

      return () => {
        // cleanup
      };
    }),
    watchSecret: fromCallback(({ sendBack, receive }) => {
      // ...

      return () => {
        // cleanup
      };
    }),
    watchWithddraw: fromCallback(({ sendBack, receive }) => {
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
  },
  guards: {
    ValidEscrowSrc: function ({ context, event }) {
      // Add your guard condition here
      return true;
    },
    validSecret: function ({ context, event }) {
      // Add your guard condition here
      return true;
    },
  },
}).createMachine({
  context: {},
  id: "ResolverMachine",
  initial: "start",
  states: {
    start: {
      on: {
        deploySrcEscrow: {
          target: "EscrowSrcCreated",
          actions: {
            type: "deploySrcEscrow",
          },
          meta: {
            user_action: true,
          },
        },
      },
    },
    EscrowSrcCreated: {
      on: {
        makerFundEscrowSrc: [
          {
            target: "EscrowSrcFunded",
            guard: {
              type: "ValidEscrowSrc",
            },
            meta: {
              user_action: true,
            },
          },
          {
            target: "finish",
          },
        ],
      },
      invoke: {
        input: {},
        src: "watchEscrowSrcFunding",
      },
    },
    EscrowSrcFunded: {
      on: {
        deployEscrowDst: {
          target: "Waiting For Secret",
          actions: {
            type: "deployDstEscrow",
          },
          meta: {
            user_action: true,
          },
        },
      },
    },
    finish: {},
    "Waiting For Secret": {
      on: {
        "Secret Revealed": {
          target: "ResolverWithdraw",
          guard: {
            type: "validSecret",
          },
          meta: {
            user_action: true,
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
        src: "watchSecret",
      },
    },
    ResolverWithdraw: {
      on: {
        ResolverWithdraw: {
          target: "finish",
          actions: {
            type: "withdraw",
          },
          meta: {
            user_action: true,
          },
        },
      },
      after: {
        "5000": {
          target: "PublicWithdraw",
        },
      },
    },
    "Resolver Cancel": {
      on: {
        ResolverCancel: {
          target: "finish",
          actions: {
            type: "cancel",
          },
          meta: {
            user_action: true,
          },
        },
      },
      after: {
        "5000": {
          target: "Public Cancel",
        },
      },
    },
    PublicWithdraw: {
      on: {
        ResolverWithdraw: {
          target: "finish",
          actions: {
            type: "withdraw",
          },
          meta: {
            user_action: true,
          },
        },
        withdraw: {
          target: "finish",
        },
      },
      after: {
        "5000": {
          target: "Resolver Cancel",
        },
      },
      invoke: {
        input: {},
        src: "watchWithddraw",
      },
    },
    "Public Cancel": {
      on: {
        ResolverCancel: {
          target: "finish",
          actions: {
            type: "cancel",
          },
          meta: {
            user_action: true,
          },
        },
        cancel: {
          target: "finish",
        },
      },
      invoke: {
        input: {},
        src: "watchCancel",
      },
    },
  },
});
