// Init state
const state = {
    isConnected: false,
    message: {}
};

// Getters
const getters = {};

// Actions
const actions = {};

// Mutation
const mutations = {
    SOCKET_ONOPEN: (state, data) => {
        state.isConnected = true;
    },
    SOCKET_ONCLOSE: (state, data) => {
        state.isConnected = false;
    },
    SOCKET_ONERROR: (state, data) => {},
    SOCKET_ONMESSAGE: (state, data) => {
        state.message = data;
    },
    SOCKET_RECONNECT(state, count) {},
    SOCKET_RECONNECT_ERROR(state) {}
};

export default {
    state,
    getters,
    actions,
    mutations
};
