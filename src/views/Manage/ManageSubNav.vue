<template>
    <b-navbar-nav class="d-flex flex-row">
        <b-nav-item
            v-if="checkUserFunction(CONSTANTS.USER_FUNCTIONS.MANAGE)"
            to="/manage/profile"
            class="text-nowrap"
        >{{ $t('profile.pageTitle') }}</b-nav-item>
        <b-nav-item v-if="checkUserFunction(CONSTANTS.USER_FUNCTIONS.MANAGE)" to="/manage/vms">VMS</b-nav-item>
        <b-nav-item
            v-if="checkUserFunction(CONSTANTS.USER_FUNCTIONS.MANAGE)"
            to="/manage/camera"
            class="text-nowrap"
        >CAMERA</b-nav-item>
        <b-nav-item
            to="/manage/user"
            class="text-nowrap"
            v-if="checkUserFunction(CONSTANTS.USER_FUNCTIONS.USER)"
        >{{ $t('user.user') }}</b-nav-item>
        <b-nav-item
            to="/manage/group"
            class="text-nowrap"
            v-if="checkUserFunction(CONSTANTS.USER_FUNCTIONS.USER)"
        >{{ $t('groups.users') }}</b-nav-item>
    </b-navbar-nav>
</template>

<script>
import { mapState } from 'vuex';
import CONSTANTS from '../../constants';
export default {
    data() {
        return {
            CONSTANTS
        };
    },
    computed: {
        ...mapState({
            currentUserDetail: state => _.cloneDeep(_.get(state.auth, 'currentUser.userDetail'))
        })
    },
    methods: {
        checkUserFunction(functionName) {
            const userFunctions = _.get(this.currentUserDetail, 'functions');
            return userFunctions.indexOf(functionName) > -1;
        }
    }
};
</script>

<style scoped>
</style>
