import apiService from '../../services/api';
// import axios from 'axios/index';
// import API_CONFIG from '@/api-config';

// Init state
const state = {
    plateProfileList: [],
    profileList: []
};

// Getters
const getters = {};

// Mutation
const mutations = {
    setPlateProfileList(state, data) {
        state.plateProfileList = data;
    },
    setProfileList(state, data) {
        state.profileList = data;
    }
};

// Actions
const actions = {
    getProfileList: async context => {
        const response = await apiService.get('profile.index');
        context.commit('setProfileList', response);
        return response;
    },
    getPlateProfileList: async context => {
        const response = await apiService.get('countVehicle.index');
        context.commit('setPlateProfileList', response);
        return response;
    },
    createPlateProfile: async (context, params) => {
        const response = await apiService.post('countVehicle.index', params);
        return response;
    },
    editPlateProfile: async (context, params) => {
        const response = await apiService.put('countVehicle.index', params);
        return response;
    },
    deletePlateProfile: async (context, params) => {
        const response = await apiService.delete('countVehicle.detail', params);
        return response;
    }
};

export default {
    namespaced: true,
    state,
    getters,
    actions,
    mutations
};
