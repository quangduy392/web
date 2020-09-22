import apiService from '../../services/api';

// Init state
const state = {
    listCountData: [],
    listCalculatedData: [],
    statisticReport: [],
    statisticSummaryReport: []
};

// Getters
const getters = {};

// Actions
const actions = {
    getTodayStatistic: (context, params) => {
        return apiService.get('countVehicle.calculateVehicle', params).then(response => {
            context.commit('SET_VEHICLE_COUNT', response);
        });
    },
    getStatisticReport: (context, params) => {
        return apiService.get('countVehicle.carStatisticReport', params).then(response => {
            context.commit('SET_STATISTIC_REPORT', response);
        });
    },
    getStatisticSummaryReport: (context, params) => {
        return Promise.all([
            apiService.get('countVehicle.carStatisticSummaryReport', { ...params, type: 'car-in' }),
            apiService.get('countVehicle.carStatisticSummaryReport', { ...params, type: 'car-out' })
        ]).then(response => {
            const comeInReport = response[0].map(item => {
                item.month = item.date.slice(0, 7);
                item.year = item.date.slice(0, 4);
                item.comeIn = item.count;
                return item;
            });
            const comeOutReport = response[1].map(item => {
                item.month = item.date.slice(0, 7);
                item.year = item.date.slice(0, 4);
                item.comeOut = item.count;
                return item;
            });
            const report = comeInReport.concat(comeOutReport);
            context.commit('SET_STATISTIC_SUMMARY_REPORT', report);
        });
    }
};

// Mutation
const mutations = {
    SET_PEOPLE_COUNT_LEVEL: (state, response) => {
        state.listCountData = response;
    },
    SET_VEHICLE_COUNT: (state, response) => {
        state.listCalculatedData = response;
    },
    SET_STATISTIC_REPORT: (state, response) => {
        state.statisticReport = response;
    },
    SET_STATISTIC_SUMMARY_REPORT: (state, response) => {
        state.statisticSummaryReport = response;
    }
};

export default {
    namespaced: true,
    state,
    getters,
    actions,
    mutations
};
