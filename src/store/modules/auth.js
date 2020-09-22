import apiService from '../../services/api';
import _ from 'lodash';
import Vue from 'vue';
import CONSTANTS from '@/constants';

const state = {
    currentUser: localStorage.getItem('currentUser')
        ? JSON.parse(localStorage.getItem('currentUser'))
        : {}
};

const getters = {
    isAuthenticated: state => !!_.get(state, 'currentUser.id'),
    currentUser: state => state.currentUser
};

const actions = {
    actionLogin: (context, params) => {
        return apiService.post('auth.login', params).then(response => {
            context.commit('LOGIN_SUCCESS', response);
        });
    },
    ssoLogin: (context, params) => {
        return apiService.post('auth.ssoLogin', params).then(response => {
            context.commit('LOGIN_SUCCESS', response);
        });
    },
    ssoLoginV2: (context, params) => {
        return apiService.post('auth.ssoLoginV2', params).then(response => {
            context.commit('LOGIN_SUCCESS', response);
        });
    },
    actionResetPass: (context, params) => {
        return apiService.post('auth.resetPass', params);
    },
    actionChangePass: (context, params) => {
        return apiService.put('auth.changePass', params);
    },
    actionLogout: context => {
        return new Promise((resolve, reject) => {
            context.commit('LOGOUT_SUCCESS');
            resolve();
        });
    },
    getCurrentUserDetail: context => {
        return apiService
            .get('user.detail', {
                id: state.currentUser.userId
            })
            .then(response => {
                context.commit('UPDATE_CURRENT_USER_DETAIL_STATE', response);
            });
    },
    updateCurrentUserOptions: (context, params) => {
        return apiService.put('user.options', params).then(response => {
            context.commit('UPDATE_CURRENT_USER_OPTIONS_STATE', response.options);
        });
    },
    saveSelectedAttCameras: (context, selectedAttCameras) => {
        context.commit('SAVE_SELECTED_ATT_CAMERAS', selectedAttCameras);
    },
    saveSelectedAttWelcomeCamera: (context, selectedAttCameras) => {
        context.commit('SAVE_SELECTED_ATT_CAMERAS_WELCOME', selectedAttCameras);
    },
    saveSelectedReceptionCameras: (context, selectedCameras) => {
        context.commit('SAVE_SELECTED_RECEPTION_CAMERAS', selectedCameras);
    },
    saveSelectedReceptionCamerasHcc: (context, selectedCameras) => {
        context.commit('SAVE_SELECTED_RECEPTION_CAMERAS_HCC', selectedCameras);
    },
    saveSelectedReceptionMapCameras: (context, selectedCameras) => {
        context.commit('SAVE_SELECTED_RECEPTION_MAP_CAMERAS', selectedCameras);
    },
    saveSelectedAlertCameras: (context, selectedCameras) => {
        context.commit('SAVE_SELECTED_ALERT_CAMERAS', selectedCameras);
    },
    saveSelectedStatisticCameras: (context, selectedCameras) => {
        context.commit('SAVE_SELECTED_STATISTIC_CAMERAS', selectedCameras);
    },
    saveSelectedCarStatisticCameras: (context, selectedCameras) => {
        context.commit('SAVE_SELECTED_CAR_STATISTIC_CAMERAS', selectedCameras);
    },
    saveSelectedFloorPlan: (context, floorPlan) => {
        context.commit('SAVE_SELECTED_FLOOR_PLAN', floorPlan);
    },
    updateState: (context, payload) => {
        context.commit('UPDATE_STATE', payload);
    }
};

const mutations = {
    LOGIN_SUCCESS: (state, response) => {
        state.currentUser = response;
        localStorage.setItem('currentUser', JSON.stringify(state.currentUser));
    },
    LOGOUT_SUCCESS: state => {
        state.currentUser = null;
        localStorage.removeItem('currentUser');
        Vue.$cookies.remove(CONSTANTS.SSO_COOKIE_TOKEN_NAME);
        Vue.$cookies.remove(
            CONSTANTS.SSO_COOKIE_TOKEN_NAME,
            CONSTANTS.SSO_COOKIE_PATH,
            CONSTANTS.SSO_COOKIE_DOMAIN
        );
    },
    UPDATE_CURRENT_USER_DETAIL_STATE: (state, response) => {
        state.currentUser = {
            ...state.currentUser,
            userDetail: response
        };
        localStorage.setItem('currentUser', JSON.stringify(state.currentUser));
    },
    UPDATE_CURRENT_USER_OPTIONS_STATE: (state, response) => {
        state.currentUser = {
            ...state.currentUser,
            userDetail: {
                ...state.currentUser.userDetail,
                options: response
            }
        };
        localStorage.setItem('currentUser', JSON.stringify(state.currentUser));
    },
    SAVE_SELECTED_ATT_CAMERAS: (state, selectedAttCameras) => {
        state.currentUser = {
            ...state.currentUser,
            selectedAttCameras: selectedAttCameras
        };
        localStorage.setItem('currentUser', JSON.stringify(state.currentUser));
    },
    SAVE_SELECTED_ATT_CAMERAS_WELCOME: (state, selectedAttCameras) => {
        state.currentUser = {
            ...state.currentUser,
            selectedAttCamerasWelcome: selectedAttCameras
        };
        localStorage.setItem('currentUser', JSON.stringify(state.currentUser));
    },
    SAVE_SELECTED_RECEPTION_CAMERAS: (state, selectedCameras) => {
        state.currentUser = {
            ...state.currentUser,
            selectedReceptionCameras: selectedCameras
        };
        localStorage.setItem('currentUser', JSON.stringify(state.currentUser));
    },
    SAVE_SELECTED_RECEPTION_CAMERAS_HCC: (state, selectedCameras) => {
        state.currentUser = {
            ...state.currentUser,
            selectedReceptionCamerasHcc: selectedCameras
        };
        localStorage.setItem('currentUser', JSON.stringify(state.currentUser));
    },
    SAVE_SELECTED_RECEPTION_MAP_CAMERAS: (state, selectedCameras) => {
        state.currentUser = {
            ...state.currentUser,
            selectedReceptionMapCameras: selectedCameras
        };
        localStorage.setItem('currentUser', JSON.stringify(state.currentUser));
    },
    SAVE_SELECTED_TRAFFIC_CAMERAS: (state, selectedCameras) => {
        state.currentUser = {
            ...state.currentUser,
            selectedTrafficCameras: selectedCameras
        };
        localStorage.setItem('currentUser', JSON.stringify(state.currentUser));
    },
    SAVE_SELECTED_ALERT_CAMERAS: (state, selectedCameras) => {
        state.currentUser = {
            ...state.currentUser,
            selectedAlertCameras: selectedCameras
        };
        localStorage.setItem('currentUser', JSON.stringify(state.currentUser));
    },
    SAVE_SELECTED_STATISTIC_CAMERAS: (state, selectedCameras) => {
        state.currentUser = {
            ...state.currentUser,
            selectedStatisticCameras: selectedCameras
        };
        localStorage.setItem('currentUser', JSON.stringify(state.currentUser));
    },
    SAVE_SELECTED_CAR_STATISTIC_CAMERAS: (state, selectedCameras) => {
        state.currentUser = {
            ...state.currentUser,
            selectedCarStatisticCameras: selectedCameras
        };
        localStorage.setItem('currentUser', JSON.stringify(state.currentUser));
    },
    SAVE_SELECTED_FLOOR_PLAN: (state, floorPlan) => {
        state.currentUser = {
            ...state.currentUser,
            selectedFloorPlan: floorPlan
        };
        localStorage.setItem('currentUser', JSON.stringify(state.currentUser));
    },
    UPDATE_STATE: (state, payload) => {
        const { stateName, value } = payload;
        state[stateName] = value;
        if (stateName === 'currentUser') {
            localStorage.setItem('currentUser', JSON.stringify(state.currentUser));
        }
    }
};

export default {
    namespaced: true,
    state,
    getters,
    actions,
    mutations
};
