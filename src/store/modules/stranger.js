import apiService from '../../services/api';
import axios from 'axios/index';
import API_CONFIG from '@/api-config';

// Init state
const state = {
    items: []
};

// Getters
const getters = {};

// Actions
const actions = {
    getNewestStrangerList: (context, params) => {
        return apiService.get('stranger.index', params).then(response => {
            context.commit('ADD_TO_TAIL', response);
            return response;
        });
    },
    getNewestStrangerListReplace: (context, params) => {
        return apiService.get('stranger.index', params).then(response => {
            context.commit('SET_LIST', response);
            return response;
        });
    },
    addNewProfile(context, params) {
        return axios
            .post(`${API_CONFIG.BASE_URL}profile-from/${params.id}/${params.name}`)
            .then(() => {
                context.commit('DELETE', params.name);
            });
    },
    deleteItem(context, params) {
        return apiService.delete('stranger.detail', params).then(() => {
            context.commit('DELETE', params.id);
        });
    }
};

// Mutation
const mutations = {
    ADD_TO_TAIL: (state, data) => {
        state.items = state.items.concat(data);
    },
    CUT_TAIL: (state, count) => {
        state.items.splice(state.items.length - count);
    },
    ADD_TO_HEAD: (state, data) => {
        state.items = data.concat(state.items);
    },
    SET_LIST: (state, data) => {
        state.items = data;
    },
    DELETE: (state, params) => {
        function findIndexData(element) {
            return element.name === params;
        }
        const index = state.items.findIndex(findIndexData);
        state.items.splice(index, 1);
    }
};

export default {
    namespaced: true,
    state,
    getters,
    actions,
    mutations
};
