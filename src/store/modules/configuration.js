import apiService from '../../services/api';

// Init state
const state = {
    items: [],
    item: {}
};

// Getters
const getters = {
    items: state => state.items
};

// Actions
const actions = {
    getList: (context, params) => {
        return apiService.get('configuration.index', params).then(response => {
            context.commit('GET_LIST_SUCCESS', response);
            return response;
        });
    },
    updateOrCreate: (context, params) => {
        return apiService[params.id ? 'put' : 'post']('configuration.index', params).then(
            response => {
                if (params.id) {
                    context.commit('UPDATE_SUCCESS', response);
                } else {
                    context.commit('CREATE_SUCCESS', response);
                }
            }
        );
    },
    delete: (context, params) => {
        return apiService.delete('configuration.detail', params).then(response => {
            context.commit('DELETE_BY_ID_SUCCESS', params);
        });
    },
    getInfo: (context, params) => {
        return apiService.get('configuration.detail', params).then(response => {
            context.commit('GET_INFO_SUCCESS', response);
        });
    }
};

// Mutation
const mutations = {
    GET_LIST_SUCCESS: (state, response) => {
        state.items = response;
    },
    GET_INFO_SUCCESS: (state, response) => {
        state.item = response;
    },
    DELETE_BY_ID_SUCCESS: (state, response) => {
        function findConfigIndex(element) {
            return element.id === response.id;
        }
        const index = state.items.findIndex(findConfigIndex);
        state.items.splice(index, 1);
    },
    CREATE_SUCCESS: (state, response) => {
        state.items.push(response);
    },
    UPDATE_SUCCESS: (state, response) => {
        function findConfigIndex(element) {
            return element.id === response.id;
        }
        const index = state.items.findIndex(findConfigIndex);
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
