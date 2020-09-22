import apiService from '../../services/api';
import axios from 'axios/index';
import API_CONFIG from '@/api-config';

// Init state
const state = {
    items: [],
    item: {},
    listAllImages: []
};

// Getters
const getters = {};

// Actions
const actions = {
    getList: (context, params) => {
        return apiService.get('profile.index', params).then(response => {
            context.commit('GET_LIST_PROFILE_SUCCESS', response);
        });
    },
    getProfile: (context, params) => {
        return apiService.get('profile.detail', params).then(response => {
            context.commit('GET_PROFILE_SUCCESS', response);
            return response;
        });
    },
    getImageProfile: (context, params) => {
        return apiService.get('profile.profileImg', params).then(response => {
            context.commit('GET_PROFILE_IMAGE_SUCCESS', response);
        });
    },
    updateOrCreate: (context, params) => {
        return apiService[params.id ? 'put' : 'post']('profile.index', params).then(response => {
            if (params.id) {
                context.commit('UPDATE_PROFILE_SUCCESS', response);
            } else {
                context.commit('CREATE_PROFILE_SUCCESS', response);
            }
        });
    },
    delete: (context, params) => {
        return apiService.delete('profile.detail', params).then(() => {
            context.commit('DELETE_PROFILE_BY_ID_SUCCESS', params);
        });
    },
    uploadAvatar: (context, params) => {
        return axios.post(
            `${API_CONFIG.BASE_URL}profile/${params.id}/upload-portrait`,
            params.data,
            { timeout: 300000 }
        );
    },
    uploadDetectedImg: (context, params) => {
        return axios.post(`${API_CONFIG.BASE_URL}profile/${params.id}/upload`, params.data, {
            timeout: 300000
        });
    },
    deleteImage: (context, params) => {
        return apiService.delete('profile.profileImgDetail', params);
    }
};

// Mutation
const mutations = {
    GET_LIST_PROFILE_SUCCESS(state, data) {
        state.items = data;
    },
    GET_PROFILE_SUCCESS(state, data) {
        state.item = data;
    },
    CREATE_PROFILE_SUCCESS(state, data) {
        state.items.push(data);
    },
    UPDATE_PROFILE_SUCCESS(state, data) {
        function findProfileIndex(element) {
            return element.id === data.id;
        }
        const index = state.items.findIndex(findProfileIndex);
        state.items.splice(index, 1, data);
    },
    DELETE_PROFILE_BY_ID_SUCCESS(state, params) {
        function findProfileIndex(element) {
            return element.id === params.id;
        }
        const index = state.items.findIndex(findProfileIndex);
        state.items.splice(index, 1);
    },
    GET_PROFILE_IMAGE_SUCCESS(state, data) {
        state.listAllImages = data;
    }
};

export default {
    namespaced: true,
    state,
    getters,
    actions,
    mutations
};
