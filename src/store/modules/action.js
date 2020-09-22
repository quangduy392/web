import apiService from '../../services/api';

// Init state
const state = {
    actions: []
};

// Getters
const getters = {};

// Actions
const actions = {
    getActionList: (context, params) => {
        return apiService.get('action.index', params).then(response => {
            context.commit('GET_ACTION_LIST_SUCCESS', response);
        });
    }
};

// Mutation
const mutations = {
    GET_ACTION_LIST_SUCCESS: (state, data) => {
        state.actions = data;
    }
};

export default {
    namespaced: true,
    state,
    getters,
    actions,
    mutations
};
