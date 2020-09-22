import apiService from '../../services/api';

// Init state
const state = {
    form: {},
    currentNode: {},
    nodeList: []
};

// Getters
const getters = {};

// Actions
const actions = {
    getStructure({ commit }) {
        commit('SET_CURRENT_NODE', {});
        return apiService.get('department.index').then(rs => {
            commit('SET_NODE_LIST', rs);
        });
    },
    addNode({ dispatch }, params) {
        return apiService.post('department.index', params);
    },
    editNode({ dispatch }, params) {
        return apiService.put('department.index', params);
    },
    deleteNode({ dispatch }, params) {
        return apiService.delete('department.detail', params);
    },
    editProfiles({ dispatch }, params) {
        return apiService.put('department.profile', params);
    }
};

// Mutation
const mutations = {
    SET_CURRENT_NODE: (state, data) => {
        state.currentNode = data;
    },
    SET_FORM: (state, data) => {
        state.form = data;
    },
    SET_NODE_LIST: (state, data) => {
        state.nodeList = data;
    }
};

export default {
    namespaced: true,
    state,
    getters,
    actions,
    mutations
};
