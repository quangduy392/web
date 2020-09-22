import apiService from '../../services/api';
import _ from 'lodash';

// Init state
const state = {
    groupPresentReport: [],
    attendanceStatus: [],
    worktimeReport: []
};

// Getters
const getters = {};

// Actions
const actions = {
    resetData: context => {
        context.commit('RESET_DATA_SUCCESS');
    },
    getGroupPresentReport: (context, params) => {
        return apiService.get('attendance.groupPresentReport', params).then(response => {
            context.commit('GET_GROUP_PRESENT_REPORT_SUCCESS', response);
        });
    },
    getAttendanceStatus: context => {
        return apiService.get('attendance.attendanceStatus').then(response => {
            context.commit('GET_ATTENDANCE_STATUS_SUCCESS', response);
        });
    },
    getAttendanceGreeting: (context, params) => {
        return apiService.get('attendance.attendanceGreeting', params).then(response => {
            return response;
        });
    },
    getAttendanceWorktimeReport: (context, params) => {
        const { morningParams, afternoonParams } = params;
        return Promise.all([
            apiService.get('attendance.staffWorkTimeReport', morningParams),
            apiService.get('attendance.staffWorkTimeReport', afternoonParams)
        ]).then(response => {
            const morningReport = response[0];
            const afternoonReport = response[1];

            const report = [];
            for (const profile of morningReport) {
                const afternoonData = _.find(afternoonReport, { id: profile.id });
                report.push({
                    id: profile.id,
                    name: profile.name,
                    group: profile.group,
                    startMorningTimeSec: profile.startTimeSec,
                    endMorningTimeSec: profile.endTimeSec,
                    startAfternoonTimeSec: afternoonData ? afternoonData.startTimeSec : undefined,
                    endAfternoonTimeSec: afternoonData ? afternoonData.endTimeSec : undefined
                });
            }
            context.commit('GET_WORKTIME_REPORT_SUCCESS', report);
        });
    }
};

// Mutation
const mutations = {
    RESET_DATA_SUCCESS: (state, response) => {
        state.groupPresentReport = [];
    },
    GET_GROUP_PRESENT_REPORT_SUCCESS: (state, response) => {
        state.groupPresentReport = response;
    },
    GET_ATTENDANCE_STATUS_SUCCESS: (state, response) => {
        state.attendanceStatus = response;
    },
    GET_WORKTIME_REPORT_SUCCESS: (state, response) => {
        state.worktimeReport = response;
    }
};

export default {
    namespaced: true,
    state,
    getters,
    actions,
    mutations
};
