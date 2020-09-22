import apiService from '../../services/api';
import _ from 'lodash';

// Init state
const state = {
    items: [],
    item: {},
    camTemp: []
};

// Getters
const getters = {};

// Actions
const actions = {
    getList: (context, params = {}) => {
        const selectedView = _.get(context, 'rootState.auth.currentUser.selectedView');
        if (!params.isFetchFullList && selectedView && context.rootState.config.nav[selectedView].viewName) {
            params = {
                ...params,
                view: context.rootState.config.nav[selectedView].viewName
            };
        }
        return apiService.get('camera.index', params).then(response => {
            context.commit('SET_CAMERA_LIST', response);
        });
    },
    getCameraInfo: (context, params) => {
        return apiService.get('camera.detail', params).then(response => {
            context.commit('SET_CAMERA_INFO', response);
        });
    },
    updateOrCreate: (context, params) => {
        return apiService[params.id ? 'put' : 'post']('camera.index', params).then(response => {
            if (params.id) {
                context.commit('UPDATE_CAM_SUCCESS', response);
            } else {
                context.commit('CREATE_CAM_SUCCESS', response);
            }
        });
    },
    delete: (context, params) => {
        return apiService.delete('camera.detail', params);
    },
    getCamTemp: (context, params) => {
        return apiService.get('camera.temp', params).then(response => {
            context.commit('GET_CAM_TEMP_SUCCESS', response);
        });
    },
    importCam: (context, params) => {
        return apiService.post('camera.listCam', params).then(response => {
            context.commit('IMPORT_CAM_SUCCESS', response);
        });
    },
    getVmsCameraInfo: (context, params) => {
        return apiService.get('camera.index', params).then(response => {
            return response;
        });
    }
};

// Mutation
const mutations = {
    SET_CAMERA_LIST: (state, data) => {
        state.items = data;
    },
    SET_CAMERA_INFO: (state, data) => {
        state.item = data;
    },
    GET_CAM_TEMP_SUCCESS: (state, data) => {
        state.camTemp = data;
    },
    CREATE_CAM_SUCCESS: (state, data) => {
        state.items.push(data);
    },
    UPDATE_CAM_SUCCESS: (state, data) => {
        function findCamIndex(element) {
            return element.id === data.id;
        }
        const index = state.items.findIndex(findCamIndex);
        state.items.splice(index, 1, data);
    },
    IMPORT_CAM_SUCCESS: (state, data) => {
        data.forEach(element => {
            state.items.push(element);
        });
    }
};

export default {
    namespaced: true,
    state,
    getters,
    actions,
    mutations
};
