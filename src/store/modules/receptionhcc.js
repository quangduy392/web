import apiService from '../../services/api';
import moment from 'moment-timezone';
import CONSTANTS from '@/constants';

// Init state
const state = {
    receptionTimes: [],
    receptionTimeReport: [],
    receptionCameraStatus: [],
    receptionCameras: []
};

// Getters
const getters = {};

// Actions
const actions = {
    resetData: context => {
        context.commit('RESET_DATA_SUCCESS');
    },
    getReceptionTimes: (context, params) => {
        return apiService.get('reception.receptionTime', params).then(response => {
            context.commit('GET_RECEPTION_TIME_SUCCESS', response);
        });
    },
    getReceptionTimeReport: (context, params) => {
        const { morningParams, afternoonParams } = params;
        const selectedView = _.get(context, 'rootState.auth.currentUser.selectedView');
        let viewParams = {};
        if (selectedView && context.rootState.config.nav[selectedView].viewName) {
            viewParams = {
                view: context.rootState.config.nav[selectedView].viewName
            };
        }

        return Promise.all([
            apiService.get('reception.receptionTimeReport', morningParams),
            apiService.get('reception.receptionTimeReport', afternoonParams),
            apiService.get('monitor.scheduled', {
                ...viewParams,
                at: moment(morningParams.from)
                    .set({ hour: 9, minute: 0, second: 0, millisecond: 0 }) // Check at 9AM
                    .unix()
            }),
            apiService.get('camera.index', viewParams)
        ]).then(response => {
            const morningReport = response[0].map(region => ({
                district: region.district,
                ward: region.ward,
                morningPresentTime: region.presentTime,
                morningStartFrame: region.startFrame,
                morningEndFrame: region.endFrame
            }));

            const afternoonReport = response[1].map(region => ({
                district: region.district,
                ward: region.ward,
                afternoonPresentTime: region.presentTime,
                afternoonStartFrame: region.startFrame,
                afternoonEndFrame: region.endFrame
            }));

            const hasScheduledCameraIds = (response[2] || [])
                .filter(monitor => monitor.enabled)
                .map(monitor => monitor.cameraId);
            const cameras = response[3];
            const hasScheduledRegions = _.uniq(
                cameras
                    .filter(camera => hasScheduledCameraIds.indexOf(camera.id) > -1)
                    .map(camera => `${camera.district ? camera.district.trim() : 'default'}???${camera.ward ? camera.ward.trim() : 'default'}`)
            );

            const allDayReport = morningReport.concat(afternoonReport);
            const reportGroupByArea = _.groupBy(
                allDayReport,
                region => `${region.district ? region.district.trim() : 'default'}???${region.ward ? region.ward.trim() : 'default'}`
            );

            const report = [];
            for (const regionName in reportGroupByArea) {
                if (reportGroupByArea.hasOwnProperty(regionName)) {
                    if (hasScheduledRegions.indexOf(regionName) > -1) {
                        // has scheduled regions
                        const regionReportData = reportGroupByArea[regionName];

                        const regionMorningReport = regionReportData.find(region => typeof region.morningPresentTime !== 'undefined');
                        const regionAfternoonReport = regionReportData.find(region => typeof region.afternoonPresentTime !== 'undefined');

                        report.push({
                            morningPresentTime: 0,
                            afternoonPresentTime: 0,
                            ...regionMorningReport,
                            ...regionAfternoonReport
                        });
                    }
                }
            }
            context.commit('GET_RECEPTION_TIME_REPORT_SUCCESS', report);
        });
    },
    getReceptionCameraStatus: (context, params) => {
        return apiService.get('reception.receptionCameraStatus', params).then(response => {
            context.commit('GET_RECEPTION_CAMERA_STATUS_SUCCESS', response);
        });
    },
    getReceptionCameras: context => {
        const selectedView = _.get(context, 'rootState.auth.currentUser.selectedView');
        let viewParams = {};
        if (selectedView && context.rootState.config.nav[selectedView].viewName) {
            viewParams = {
                view: context.rootState.config.nav[selectedView].viewName
            };
        }

        return Promise.all([
            apiService.get('camera.index', viewParams),
            apiService.get('reception.receptionTime'),
            apiService.get('monitor.scheduled', {
                ...viewParams,
                at: moment()
                    .set({ hour: 9, minute: 0, second: 0, millisecond: 0 }) // Check at 9AM
                    .unix()
            }),
            apiService.get('reception.receptionCameraStatus')
        ]).then(response => {
            const cameras = response[0];

            const receptionsTimes = (response[1] || []).map(receptionTime => {
                return {
                    id: receptionTime.id,
                    presentTime: receptionTime.presentTime ? parseInt(receptionTime.presentTime) : 0
                };
            });

            const hasScheduledCameraIds = (response[2] || [])
                .filter(monitor => monitor.enabled)
                .map(monitor => monitor.cameraId);

            const receptionCameraStatuses = (response[3] || []).map(cameraStatus => {
                let status = null;

                const hasReceptionSchedule = hasScheduledCameraIds.indexOf(cameraStatus.id) > -1;

                if (hasReceptionSchedule) {
                    if (_.isNumber(cameraStatus.ratio) && cameraStatus.ratio >= 0) {
                        if (cameraStatus.ratio <= CONSTANTS.PRESENT_CAM_RATIO) {
                            status = CONSTANTS.RECEPTION_CAMERA_STATUSES.ABSENT;
                        } else {
                            status = CONSTANTS.RECEPTION_CAMERA_STATUSES.PRESENT;
                        }
                    } else {
                        status = CONSTANTS.RECEPTION_CAMERA_STATUSES.BROKEN;
                    }
                } else {
                    status = CONSTANTS.RECEPTION_CAMERA_STATUSES.NO_SCHEDULE;
                }
                return {
                    id: cameraStatus.id,
                    status
                };
            });

            const receptionCameras = cameras.map(camera => {
                const receptionTime = receptionsTimes.find(item => item.id === camera.id) || {};
                const receptionCameraStatus =
                    receptionCameraStatuses.find(item => item.id === camera.id) || {};
                return {
                    ...camera,
                    ...receptionTime,
                    ...receptionCameraStatus
                };
            });

            context.commit('GET_RECEPTION_CAMERA_SUCCESS', receptionCameras);
        });
    }
};

// Mutation
const mutations = {
    RESET_DATA_SUCCESS: (state, response) => {
        state.receptionTimes = [];
        state.receptionTimeReport = [];
    },
    GET_RECEPTION_TIME_SUCCESS: (state, response) => {
        state.receptionTimes = response;
    },
    GET_RECEPTION_TIME_REPORT_SUCCESS: (state, response) => {
        state.receptionTimeReport = response;
    },
    GET_RECEPTION_CAMERA_STATUS_SUCCESS: (state, data) => {
        state.receptionCameraStatus = data;
    },
    GET_RECEPTION_CAMERA_SUCCESS: (state, data) => {
        state.receptionCameras = data;
    }
};

export default {
    namespaced: true,
    state,
    getters,
    actions,
    mutations
};
