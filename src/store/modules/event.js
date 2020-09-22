import apiService from '../../services/api';
import _ from 'lodash';

// Init state
const state = {
    events: [],
    selectedEventList: [],
    types: [],
    eventCountLevel: []
};

// Getters
const getters = {};

// Actions
const actions = {
    getNewestEventList: (context, params = {}) => {
        const selectedView = _.get(context, 'rootState.auth.currentUser.selectedView');
        if (!params.isFetchFullList && selectedView && context.rootState.config.nav[selectedView].viewName) {
            params = {
                ...params,
                view: context.rootState.config.nav[selectedView].viewName
            };
        }
        return apiService.get('event.newest', params).then(response => {
            context.commit('ADD_TO_TAIL', response);
            return response;
        });
    },
    refreshEventList: (context, params = {}) => {
        const selectedView = _.get(context, 'rootState.auth.currentUser.selectedView');
        if (!params.isFetchFullList && selectedView && context.rootState.config.nav[selectedView].viewName) {
            params = {
                ...params,
                view: context.rootState.config.nav[selectedView].viewName
            };
        }
        return apiService.get('event.newest', params).then(response => {
            context.commit('ADD_TO_HEAD', response);
            context.commit('CUT_TAIL', response.length);
        });
    },
    getNewestEventListReplace: (context, params = {}) => {
        const selectedView = _.get(context, 'rootState.auth.currentUser.selectedView');
        if (!params.isFetchFullList && selectedView && context.rootState.config.nav[selectedView].viewName) {
            params = {
                ...params,
                view: context.rootState.config.nav[selectedView].viewName
            };
        }
        return apiService.get('event.newest', params).then(response => {
            context.commit('SET_EVENT_LIST', response);
            return response;
        });
    },
    getEventTypes: (context, params) => {
        const selectedView = _.get(context, 'rootState.auth.currentUser.selectedView');
        if (!_.get(params, 'isFetchFullList') && selectedView && context.rootState.config.nav[selectedView].viewName) {
            params = {
                ...params,
                view: context.rootState.config.nav[selectedView].viewName
            };
        }
        return apiService.get('event.type', params).then(response => {
            context.commit('SET_EVENT_TYPE_LIST', response);
        });
    },
    createEvent: (context, params) => {
        return apiService.post('event.index', params).then(response => {
            // context.commit('UPDATE_EVENT_LIST', response);
        });
    },
    updateEvent: (context, params) => {
        return apiService.put('event.index', params).then(response => {
            context.commit('UPDATE_EVENT_LIST', response);
        });
    },
    deleteBookmarkEvent: (context, params) => {
        return apiService.put('event.index', params).then(response => {
            context.commit('UN_BOOKMARK_EVENT', response);
        });
    },
    getEventCountLevel: (context, params) => {
        const selectedView = _.get(context, 'rootState.auth.currentUser.selectedView');
        if (!_.get(params, 'isFetchFullList') && selectedView && context.rootState.config.nav[selectedView].viewName) {
            params = {
                ...params,
                view: context.rootState.config.nav[selectedView].viewName
            };
        }
        return apiService.get('event.countLevel', params).then(response => {
            context.commit('SET_EVENT_COUNT_LEVEL', response);
        });
    },
    getNewestEventNoCommit: (context, params = {}) => {
        const selectedView = _.get(context, 'rootState.auth.currentUser.selectedView');
        if (!params.isFetchFullList && selectedView && context.rootState.config.nav[selectedView].viewName) {
            params = {
                ...params,
                view: context.rootState.config.nav[selectedView].viewName
            };
        }
        return apiService.get('event.newest', params).then(response => {
            return response;
        });
    },
    deleteEvent: (context, params) => {
        return apiService.delete('event.detail', params).then(response => {
            context.commit('DELETE_BY_ID_SUCCESS', params);
        });
    }
};

// Mutation
const mutations = {
    ADD_TO_TAIL: (state, data) => {
        state.events = state.events.concat(data);
    },
    CUT_TAIL: (state, count) => {
        state.events.splice(state.events.length - count);
    },
    ADD_TO_HEAD: (state, data) => {
        state.events = data.concat(state.events);
    },
    SET_EVENT_LIST: (state, data) => {
        state.events = data;
    },
    ADD_SELECTED_EVENT: (state, data) => {
        state.selectedEventList.push(data);
    },
    SET_SELECTED_EVENT: (state, data) => {
        state.selectedEventList = data;
    },
    UNSELECT_EVENT: (state, data) => {
        state.selectedEventList = state.selectedEventList.filter(el => el.id !== data.id);
    },
    SET_EVENT_TYPE_LIST: (state, data) => {
        state.types = data;
    },
    UPDATE_EVENT_LIST: (state, data) => {
        state.events.splice(
            state.events.findIndex(el => el.id === data.id),
            1,
            data
        );
    },
    UN_BOOKMARK_EVENT: (state, data) => {
        state.events.splice(
            state.events.findIndex(el => el.id === data.id),
            1
        );
    },
    SET_EVENT_COUNT_LEVEL: (state, data) => {
        state.eventCountLevel = data;
    },
    DELETE_BY_ID_SUCCESS: (state, response) => {
        function findConfigIndex(element) {
            return element.id === response.id;
        }
        const index = state.events.findIndex(findConfigIndex);
        state.events.splice(index, 1);
    }
};

export default {
    namespaced: true,
    state,
    getters,
    actions,
    mutations
};
