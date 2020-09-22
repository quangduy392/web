import apiService from '../../services/api';
// Init state
const state = {
    items: [],
    item: {},
    listTemplate: []
};

// Getters
const getters = {};

// Actions
const actions = {
    getList: context => {
        return apiService.get('report.index').then(response => {
            context.commit('SET_REPORT_LIST', response);
        });
    },
    getListTemplate: context => {
        return apiService.get('template.index').then(response => {
            context.commit('SET_TEMPLATE_LIST', response);
        });
    },
    getTemplate: (context, params) => {
        return apiService.get('template.detail', params).then(response => {
            return response;
        });
    },
    getReportInfo: (context, params) => {
        return apiService.get('report.detail', params).then(response => {
            context.commit('SET_REPORT_INFO', response);
        });
    },
    createReport: (context, params) => {
        return apiService.post('report.index', params);
    },
    updateReport: (context, params) => {
        return apiService.put('report.index', params);
    },
    deleteReport: (context, params) => {
        return apiService.delete('report.detail', params);
    },
    getCaseDetail: (context, params) => {
        return apiService.get('caseVideo.index', params).then(response => {
            return response;
        });
    }
};

// Mutation
const mutations = {
    SET_REPORT_LIST: (state, data) => {
        state.items = data;
    },
    SET_TEMPLATE_LIST: (state, data) => {
        state.listTemplate = data;
    },
    SET_REPORT_INFO: (state, data) => {
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
