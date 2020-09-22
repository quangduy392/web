import apiService from '../../services/api';

// Init state
const state = {
    items: []
};

// Getters
const getters = {};

// Actions
const actions = {
    resetData: context => {
        context.commit('RESET_DATA_SUCCESS');
    },
    getList: (context, params) => {
        return apiService.get('caseVideo.index', params).then(response => {
            context.commit('GET_LIST_SUCCESS', response);
        });
    },
    getListFull: (context, params) => {
        return apiService.get('caseVideo.indexFull', params).then(response => {
            context.commit('GET_LIST_SUCCESS', response);
            return response;
        });
    },
    updateOrCreate: (context, params) => {
        return apiService[params.id ? 'put' : 'post']('caseVideo.index', params);
    },
    delete: (context, params) => {
        return apiService.delete('caseVideo.detail', params);
    },
    createMultiple: (context, params) => {
        return apiService.post('caseVideo.createMultiple', params);
    },
    updateState: (context, payload) => {
        context.commit('UPDATE_STATE', payload);
    }
};

// Mutation
const mutations = {
    RESET_DATA_SUCCESS: (state, response) => {
        state.items = [];
    },
    GET_LIST_SUCCESS: (state, response) => {
        state.items = response;
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
