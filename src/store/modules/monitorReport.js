import apiService from '../../services/api';

// Init state
const state = {
    items: []
    // item: {}
};

// Getters
const getters = {};

// Actions
const actions = {
    getMonitorReportList: (context, params = {}) => {
        return apiService.get('monitorReport.index', params).then(response => {
            context.commit('GET_MONITOR_REPORT_LIST', response);
        });
    }
    // getMonitorReportInfo: (context, params) => {
    //     return apiService.get('monitorReport.detail', params).then(response => {
    //         context.commit('GET_MONITOR_REPORT_INFO', response);
    //     });
    // },
};

// Mutation
const mutations = {
    GET_MONITOR_REPORT_LIST: (state, response) => {
        state.items = response;
    }
    // GET_MONITOR_REPORT_INFO: (state, response) => {
    //     state.item = response;
    // }
};

export default {
    namespaced: true,
    state,
    getters,
    actions,
    mutations
};
