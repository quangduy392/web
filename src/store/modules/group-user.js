import apiService from '../../services/api';
// Init state
const state = {
    groups: [],
    group: {}
};

// Getters
const getters = {};

// Actions
const actions = {
    getListGroups: (context, params) => {
        return apiService.get('group.index', params).then(response => {
            context.commit('GET_LIST_GROUPS_SUCCESS', response);
        });
    },
    getGroupInfo: (context, params) => {
        return apiService.get('group.detail', params).then(response => {
            context.commit('GET_GROUP_INFO_SUCCESS', response);
        });
    },
    createNewGroup: (context, params) => {
        return apiService.post('group.index', params).then(response => {
            context.commit('ADD_NEW_GROUP_SUCCESS', response);
        });
    },
    updateGroupInfo: (context, params) => {
        return apiService.put('group.index', params).then(response => {
            context.commit('UPDATE_GROUP_INFO_SUCCESS', response);
        });
    },
    deleteGroupById: (context, params) => {
        return apiService.delete('group.detail', params).then(() => {
            context.commit('DELETE_GROUP_BY_ID_SUCCESS', params);
        });
    }
};

// Mutation
const mutations = {
    GET_LIST_GROUPS_SUCCESS(state, groups) {
        state.groups = groups;
    },
    GET_GROUP_INFO_SUCCESS(state, group) {
        state.group = group;
    },
    ADD_NEW_GROUP_SUCCESS(state, group) {
        state.groups.push(group);
    },
    UPDATE_GROUP_INFO_SUCCESS(state, group) {
        function findGroupIndex(element) {
            return element.id === group.id;
        }
        const index = state.groups.findIndex(findGroupIndex);
        state.groups.splice(index, 1, group);
    },
    DELETE_GROUP_BY_ID_SUCCESS(state, params) {
        function findGroupIndex(element) {
            return element.id === params.id;
        }
        const index = state.groups.findIndex(findGroupIndex);
        state.groups.splice(index, 1);
    }
};

export default {
    namespaced: true,
    state,
    getters,
    actions,
    mutations
};
