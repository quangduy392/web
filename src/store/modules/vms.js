import apiService from '../../services/api';

// Init state
const state = {
    items: [],
    vmsTemp: [],
    vmsInfo: {}
};

// Getters
const getters = {};

// Actions
const actions = {
    resetData: context => {
        context.commit('RESET_DATA_SUCCESS');
    },
    getList: (context, params) => {
        return apiService.get('vms.index', params).then(response => {
            context.commit('GET_LIST_SUCCESS', response);
        });
    },
    updateOrCreate: (context, params) => {
        return apiService[params.id ? 'put' : 'post']('vms.index', params).then(response => {
            if (params.id) {
                context.commit('UPDATE_VMS_SUCCESS', response);
            } else {
                context.commit('CREATE_VMS_SUCCESS', response);
            }
        });
    },
    delete: (context, params) => {
        return apiService.delete('vms.detail', params).then(response => {
            context.commit('DELETE_VMS_BY_ID_SUCCESS', params);
        });
    },
    getVmsTemp: (context, params) => {
        return apiService.get('vms.temp', params).then(response => {
            context.commit('GET_VMS_TEMP_SUCCESS', response);
        });
    },
    getVmsInfo: (context, params) => {
        return apiService.get('vms.detail', params).then(response => {
            context.commit('GET_VMS_INFO_SUCCESS', response);
        });
    }
};

// Mutation
const mutations = {
    RESET_DATA_SUCCESS: (state, response) => {
        state.items = [];
    },
    GET_LIST_SUCCESS: (state, response) => {
        state.items = response;
    },
    GET_VMS_TEMP_SUCCESS: (state, response) => {
        state.vmsTemp = response;
    },
    GET_VMS_INFO_SUCCESS: (state, response) => {
        state.vmsInfo = response;
    },
    DELETE_VMS_BY_ID_SUCCESS: (state, response) => {
        function findVmsIndex(element) {
            return element.id === response.id;
        }
        const index = state.items.findIndex(findVmsIndex);
        state.items.splice(index, 1);
    },
    CREATE_VMS_SUCCESS: (state, response) => {
        state.items.push(response);
    },
    UPDATE_VMS_SUCCESS: (state, response) => {
        function findVmsIndex(element) {
            return element.id === response.id;
        }
        const index = state.items.findIndex(findVmsIndex);
        state.items.splice(index, 1, response);
    }
};

export default {
    namespaced: true,
    state,
    getters,
    actions,
    mutations
};
