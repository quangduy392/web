<template>
    <router-view></router-view>
</template>

<script>
import axios from 'axios/index';
import { mapState, mapActions } from 'vuex';
import _ from 'lodash';

export default {
    name: 'app',
    mounted: function() {
        this.updateRequestHeader();
        axios.interceptors.response.use(
            response => {
                // this.hideLoading();
                return response;
            },
            error => {
                const errorStatus = _.get(error, 'response.status');
                if (errorStatus === 403) {
                    this.getCurrentUserDetail();
                    this.$router.push('/home');
                } else if (errorStatus === 401) {
                    this.actionLogout().then(() => {
                        this.$router.push('/login');
                    });
                } else {
                    const errorReason = _.get(error, 'response.data.reason');
                    this.$toaster.error(errorReason || 'Xảy ra lỗi, vui lòng thử lại!');
                }
                // this.hideLoading();

                return Promise.reject(error.response);
            }
        );
    },
    computed: {
        ...mapState({
            currentUser: state => state.auth.currentUser
        })
    },
    watch: {
        currentUser() {
            this.updateRequestHeader();
        }
    },
    methods: {
        ...mapActions({
            showLoading: 'page/showLoading',
            hideLoading: 'page/hideLoading',
            getCurrentUserDetail: 'auth/getCurrentUserDetail',
            actionLogout: 'auth/actionLogout'
        }),
        updateRequestHeader() {
            axios.interceptors.request.use(
                config => {
                    // this.showLoading();
                    if (this.currentUser && config.url.indexOf('/vms/api/') === -1) {
                        config.headers.Authorization = `Bearer ${this.currentUser.token}`;
                    }
                    if (config.url.indexOf('video-heatmap') > -1) {
                        config.responseType = 'arraybuffer';
                    }
                    return config;
                },
                function(err) {
                    return Promise.reject(err);
                }
            );
        }
    }
};
</script>

<style lang="scss">
// Import Main styles for this application
@import './scss/style';
</style>
