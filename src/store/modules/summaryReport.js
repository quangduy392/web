import apiService from '../../services/api';
// Init state
const state = {};

// Getters
const getters = {};

// Actions
const actions = {
    getTimeReport: (context, params) => {
        return apiService.get('summaryReport.timeReport', params).then(response => {
            return response;
        });
    },
    getLateReport: (context, params) => {
        return apiService.get('summaryReport.lateReport', params).then(response => {
            return response;
        });
    },
    getAbsentReport: (context, params) => {
        return apiService.get('summaryReport.absentReport', params).then(response => {
            return response;
        });
    },
    getTopLate: (context, params) => {
        return apiService.get('summaryReport.topLate', params).then(response => {
            return response;
        });
    },
    getTopAbsent: (context, params) => {
        return apiService.get('summaryReport.topAbsent', params).then(response => {
            return response;
        });
    },
    getStaffTimeReport: (context, params) => {
        return apiService.get('summaryReport.staffTimeReport', params).then(response => {
            return response;
        });
    },
    getStaffLateReport: (context, params) => {
        return apiService.get('summaryReport.staffLateReport', params).then(response => {
            return response;
        });
    },
    getStaffAbsentReport: (context, params) => {
        return apiService.get('summaryReport.staffAbsentReport', params).then(response => {
            return response;
        });
    }
};

// Mutation
const mutations = {};

export default {
    namespaced: true,
    state,
    getters,
    actions,
    mutations
};
