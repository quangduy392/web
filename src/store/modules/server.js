import apiService from '../../services/api';

// Init state
const state = {
    monitorServers: [],
    servers: [],
    item: {}
};

// Getters
const getters = {};

// Actions
const actions = {
    getServerList: (context, params) => {
        return apiService.get('server.index', params).then(response => {
            context.commit('SET_SERVER_LIST', response);
        });
    },
    getMonitorServerList: (context, params) => {
        return apiService.get('server.index', params).then(response => {
            context.commit('SET_MONITOR_SERVER_LIST', response);
        });
    },
    getDetail: (context, params) => {
        return apiService.get('server.detail', params).then(response => {
            context.commit('GET_SERVER_DETAIL_SUCCESS', response);
            return response;
        });
    }
};

// Mutation
const mutations = {
    SET_SERVER_LIST: (state, data) => {
        state.servers = data;
    },
    SET_MONITOR_SERVER_LIST: (state, data) => {
        state.monitorServers = data.filter(el => el.type === 'monitor');
    },
    GET_SERVER_DETAIL_SUCCESS: (state, data) => {
        state.item = data;
    }
};

export default {
    namespaced: true,
    state,
    getters,
    actions,
    mutations
};
