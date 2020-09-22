import apiService from '../../services/api';

// Init state
const state = {
    items: [],
    item: {}
};

// Getters
const getters = {};

// Actions
const actions = {
    resetData: context => {
        context.commit('RESET_DATA_SUCCESS');
    },
    getList: (context, params) => {
        return apiService.get('analyzeCase.indexFull', params).then(response => {
            context.commit('GET_LIST_SUCCESS', response);
        });
    },
    getDetail: (context, params) => {
        return apiService.get('analyzeCase.detail', params).then(response => {
            context.commit('GET_DETAIL_SUCCESS', response);
        });
    },
    updateOrCreate: (context, params) => {
        return apiService[params.id ? 'put' : 'post']('analyzeCase.index', params).then(response => {
            context.commit('GET_DETAIL_SUCCESS', response);
        });
    },
    delete: (context, params) => {
        return apiService.delete('analyzeCase.detail', params);
    }
};

// Mutation
const mutations = {
    RESET_DATA_SUCCESS: (state, response) => {
        state.items = [];
        state.item = {};
    },
    GET_LIST_SUCCESS: (state, response) => {
        state.items = response;
    },
    GET_DETAIL_SUCCESS: (state, response) => {
        state.item = response;
    }
};

export default {
    namespaced: true,
    state,
    getters,
    actions,
    mutations
};
