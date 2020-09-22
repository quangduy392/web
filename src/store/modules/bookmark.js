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
        return apiService.get('bookmark.index', params).then(response => {
            context.commit('GET_LIST_SUCCESS', response);
        });
    },
    getDetail: (context, params) => {
        return apiService.get('bookmark.detail', params).then(response => {
            context.commit('GET_DETAIL_SUCCESS', response);
        });
    },
    updateOrCreate: (context, params) => {
        return apiService[params.id ? 'put' : 'post']('bookmark.index', params);
    },
    delete: (context, params) => {
        return apiService.delete('bookmark.detail', params);
    },
    updateState: (context, payload) => {
        context.commit('UPDATE_STATE', payload);
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
    },
    UPDATE_STATE: (state, payload) => {
        const { stateName, value } = payload;
        state[stateName] = value;
    }
};

export default {
    namespaced: true,
    state,
    getters,
    actions,
    mutations
};
