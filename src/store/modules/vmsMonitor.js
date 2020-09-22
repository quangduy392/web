import apiService from '../../services/api';
import CONSTANTS from '../../constants';
import API_CONFIG from '../../api-config';

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
        const endpoint = params.vmsBaseUrl + 'api/' + _.get(API_CONFIG, 'vmsMonitor.index');
        delete params.vmsBaseUrl;

        return apiService
            .get(endpoint, params, CONSTANTS.ENDPOINT_SERVICE.VMS_API)
            .then(response => {
                context.commit('GET_LIST_SUCCESS', response);
            });
    }
};

// Mutation
const mutations = {
    RESET_DATA_SUCCESS: (state, response) => {
        state.items = [];
    },
    GET_LIST_SUCCESS: (state, response) => {
        state.items = response;
    }
};

export default {
    namespaced: true,
    state,
    getters,
    actions,
    mutations
};
