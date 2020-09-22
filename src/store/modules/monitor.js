import apiService from '../../services/api';
import _ from 'lodash';

// Init state
const state = {
    monitors: [],
    types: [],
    selectedMonitor: {},
    params: [],
    allMonitors: []
};

// Getters
const getters = {};

// Actions
const actions = {
    getAllMonitors: (context, params) => {
        return apiService.get('monitor.index', params).then(response => {
            context.commit('GET_ALL_MONITORS', response);
        });
    },
    getMonitorList: (context, params = {}) => {
        const selectedView = _.get(context, 'rootState.auth.currentUser.selectedView');
        if (!params.isFetchFullList && selectedView && context.rootState.config.nav[selectedView].viewName) {
            params = {
                ...params,
                view: context.rootState.config.nav[selectedView].viewName
            };
        }
        return apiService.get('monitor.index', params).then(response => {
            context.commit('SET_MONITOR_LIST', response);
        });
    },
    getMonitorTypeList: (context, params) => {
        const selectedView = _.get(context, 'rootState.auth.currentUser.selectedView');
        if (!_.get(params, 'isFetchFullList') && selectedView && context.rootState.config.nav[selectedView].viewName) {
            params = {
                ...params,
                view: context.rootState.config.nav[selectedView].viewName
            };
        }
        return apiService.get('monitor.type', params).then(response => {
            context.commit('SET_MONITOR_TYPE_LIST', response);
        });
    },
    createMonitor: (context, params) => {
        const selectedView = _.get(context, 'rootState.auth.currentUser.selectedView');
        if (!params.isFetchFullList && selectedView && context.rootState.config.nav[selectedView].viewName) {
            params = {
                ...params,
                view: context.rootState.config.nav[selectedView].viewName
            };
        }
        return apiService.post('monitor.index', params).then(response => {
            context.commit('ADD_MONITOR', response);
        });
    },
    updateMonitor: (context, params) => {
        return apiService.put('monitor.index', params).then(response => {
            context.commit('UPDATE_MONITOR_LIST', response);
        });
    },
    deleteMonitor: (context, params) => {
        return apiService.delete('monitor.detail', params).then(() => {
            context.commit('DELETE_MONITOR', params);
        });
    },
    getParams: (context, params) => {
        return apiService.get('monitor.param', params).then(response => {
            context.commit('SET_PARAMS', response);
        });
    }
};

// Mutation
const mutations = {
    SET_MONITOR_LIST: (state, data) => {
        state.monitors = data;
    },
    SET_MONITOR_TYPE_LIST: (state, data) => {
        state.types = data;
    },
    SET_SELECTED_MONITOR: (state, data) => {
        state.selectedMonitor = data;
    },
    ADD_MONITOR: (state, data) => {
        state.monitors.push(data);
    },
    UPDATE_MONITOR_LIST: (state, data) => {
        state.monitors.splice(
            state.monitors.findIndex(el => el.id === data.id),
            1,
            data
        );
    },
    DELETE_MONITOR: (state, data) => {
        state.monitors.splice(
            state.monitors.findIndex(el => el.id === data.id),
            1
        );
    },
    SET_PARAMS: (state, data) => {
        state.params = data;
    },
    GET_ALL_MONITORS: (state, data) => {
        state.allMonitors = data;
    }
};

export default {
    namespaced: true,
    state,
    getters,
    actions,
    mutations
};
