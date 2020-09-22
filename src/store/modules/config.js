// import apiService from '../../services/api';
// import CONSTANTS from '../../constants';

// Init state
const state = {
    floorPlan: {},
    nav: 'Haha'
};

// Getters
const getters = {};

// Actions
const actions = {
    // getListUsers: (context, params) => {
    //     return apiService.get('user.index', params).then(response => {
    //         context.commit('GET_LIST_USERS', response);
    //     });
    // },
    // getListUsersByGroupId: (context, params) => {
    //     return apiService.get('group.user', params).then(response => {
    //         context.commit('GET_LIST_USERS_BY_GROUP_ID', response);
    //     });
    // },
    // getAllFunctions: (context, params) => {
    //     return apiService.get('user.functions', params).then(response => {
    //         context.commit('GET_ALL_FUNCTIONS_SUCCESS', response);
    //     });
    // },
    // getUserInfo: (context, params) => {
    //     return apiService.get('user.detail', params).then(response => {
    //         context.commit('GET_USER_INFO_SUCCESS', response);
    //     });
    // },
    // deleteUserById: (context, params) => {
    //     return apiService.delete('user.detail', params).then(response => {
    //         context.commit('DELETE_USER_BY_ID_SUCCESS', params);
    //     });
    // },
    // createNewUser: (context, params) => {
    //     return apiService.post('user.index', params).then(response => {
    //         context.commit('ADD_NEW_USER_SUCCESS', response);
    //     });
    // },
    // updateUserInfo: (context, params) => {
    //     return apiService.put('user.index', params).then(response => {
    //         context.commit('UPDATE_USER_INFO_SUCCESS', response);
    //     });
    // },
    // updateUserInfoAdmin: (context, params) => {
    //     return apiService.put('user.admin', params).then(response => {
    //         context.commit('UPDATE_USER_INFO_SUCCESS', response);
    //     });
    // }
};

// Mutation
const mutations = {
    SET_CONFIG(state, config) {
        state.floorPlan = config.floorPlan;
        state.nav = config.nav;
    }
};

export default {
    namespaced: true,
    state,
    getters,
    actions,
    mutations
};
