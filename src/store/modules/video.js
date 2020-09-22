import apiService from '@/services/api';
import API_CONFIG from '@/api-config';

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
        return apiService.get('video.index', params).then(response => {
            context.commit('GET_LIST_SUCCESS', response);
        });
    },
    updateOrCreate: (context, params) => {
        return apiService[params.id ? 'put' : 'post']('video.index', params).then(
            response => response
        );
    },
    delete: (context, params) => {
        return apiService.delete('video.detail', params);
    },
    getObjectFocusVideo: (context, params) => {
        const { server, data } = params;
        const endpoint = `http://${server.ip}:${server.port}/api/${_.get(
            API_CONFIG,
            'video.objectFocus'
        )}`;
        return apiService.post(endpoint, data).then(response => response);
    },
    getObjectOriginVideo: (context, params) => {
        const { server, data } = params;
        const endpoint = `http://${server.ip}:${server.port}/api/${_.get(
            API_CONFIG,
            'video.objectOrigin'
        )}`;
        return apiService.post(endpoint, data).then(response => response);
    },
    getHeatMapImage: (context, params) => {
        const { server, data } = params;
        const endpoint = `http://${server.ip}:${server.port}/api/${_.get(
            API_CONFIG,
            'video.heatMap'
        )}`;
        return apiService.post(endpoint, data).then(response => response);
    },
    getBriefVideo: (context, params) => {
        const { server, data } = params;
        const endpoint = `http://${server.ip}:${server.port}/api/${_.get(
            API_CONFIG,
            'video.briefVideo'
        )}`;
        console.log(params);
        return apiService.post(endpoint, data).then(response => response);
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
