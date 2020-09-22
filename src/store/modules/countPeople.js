import apiService from '../../services/api';
import _ from 'lodash';

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
    getPeopleCountByLevelZone: (context, params) => {
        const selectedView = _.get(context, 'rootState.auth.currentUser.selectedView');
        if (!_.get(params, 'isFetchFullList') && selectedView && context.rootState.config.nav[selectedView].viewName) {
            params = {
                ...params,
                view: context.rootState.config.nav[selectedView].viewName
            };
        }
        return apiService.get('countPeople.count', params).then(response => {
            context.commit('SET_PEOPLE_COUNT_LEVEL', response);
        });
    },
    getTodayStatistic: (context, params) => {
        return apiService.get('countPeople.calculatePeople', params).then(response => {
            context.commit('SET_PEOPLE_COUNT', response);
        });
    },
    getStatisticReport: (context, params) => {
        return apiService.get('countPeople.statisticReport', params).then(response => {
            context.commit('SET_STATISTIC_REPORT', response);
        });
    },
    getStatisticSummaryReport: (context, params) => {
        return Promise.all([
            apiService.get('countPeople.statisticSummaryReport', { ...params, type: 'people-in' }),
            apiService.get('countPeople.statisticSummaryReport', { ...params, type: 'people-out' })
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
    SET_PEOPLE_COUNT: (state, response) => {
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
