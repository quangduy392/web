import apiService from '../../services/api';
import _ from 'lodash';
// Init state
const state = {
    items: [],
    item: {},
    cameras: [],
    zoneCamera: []
};

// Getters
const getters = {};

// Actions
const actions = {
    getListZones: (context, params = {}) => {
        const selectedView = _.get(context, 'rootState.auth.currentUser.selectedView');
        if (!params.isFetchFullList && selectedView && context.rootState.config.nav[selectedView].viewName) {
            params = {
                ...params,
                view: context.rootState.config.nav[selectedView].viewName
            };
        }
        return apiService.get('zone.index', params).then(response => {
            context.commit('GET_LIST_ZONES', response);
        });
    },
    getListZoneCamera: (context, params) => {
        return apiService.get('zone.camera', params).then(response => {
            context.commit('GET_LIST_ZONES_CAMERA', response);
            return response;
        });
    },
    addZoneCamera: (context, params) => {
        return apiService.post('zone.camera', params).then(response => {
            return response;
        });
    },
    deleteZoneCamera: (context, params) => {
        return apiService.delete('zone.cameraDetail', params).then(response => {
            return response;
        });
    },
    updateZone: (context, params) => {
        return apiService.put('zone.index', params).then(response => { });
    },
    getZoneInfo: (context, params) => {
        return apiService.get('zone.detail', params).then(response => {
            context.commit('GET_ZONE_INFO_SUCCESS', response);
        });
    },
    createNewZone: (context, params) => {
        const selectedView = _.get(context, 'rootState.auth.currentUser.selectedView');
        if (!params.isFetchFullList && selectedView && context.rootState.config.nav[selectedView].viewName) {
            params = {
                ...params,
                view: context.rootState.config.nav[selectedView].viewName
            };
        }
        return apiService.post('zone.index', params).then(response => {
            context.commit('ADD_NEW_ZONE_SUCCESS', response);
        });
    },
    updateZoneInfo: (context, params) => {
        const selectedView = _.get(context, 'rootState.auth.currentUser.selectedView');
        if (!params.isFetchFullList && selectedView && context.rootState.config.nav[selectedView].viewName) {
            params = {
                ...params,
                view: context.rootState.config.nav[selectedView].viewName
            };
        }
        return apiService.put('zone.index', params).then(response => {
            context.commit('UPDATE_ZONE_INFO_SUCCESS', response);
        });
    },
    deleteZoneById: (context, params) => {
        return apiService.delete('zone.detail', params).then(() => {
            context.commit('DELETE_ZONE_BY_ID_SUCCESS', params);
        });
    }
};

// Mutation
const mutations = {
    GET_LIST_ZONES: (state, response) => {
        state.items = response;
    },
    GET_LIST_ZONE_CAMERA: (state, response) => {
        state.cameras = response;
    },
    GET_LIST_ZONES_CAMERA: (state, response) => {
        state.zoneCamera = response;
    },
    GET_ZONE_INFO_SUCCESS: (state, response) => {
        state.item = response;
    },
    ADD_NEW_ZONE_SUCCESS(state, data) {
        state.items.push(data);
    },
    UPDATE_ZONE_INFO_SUCCESS(state, data) {
        function findZoneIndex(element) {
            return element.id === data.id;
        }
        const index = state.items.findIndex(findZoneIndex);
        state.items.splice(index, 1, data);
    },
    DELETE_ZONE_BY_ID_SUCCESS(state, params) {
        function findZoneIndex(element) {
            return element.id === params.id;
        }
        const index = state.items.findIndex(findZoneIndex);
        state.items.splice(index, 1);
    }
};

export default {
    namespaced: true,
    state,
    getters,
    actions,
    mutations
};
