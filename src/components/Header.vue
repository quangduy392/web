<template>
    <header class="app-header navbar">
        <b-link class="custom-navbar-brand" to="/home"></b-link>

        <b-navbar-nav class="ml-auto">
            <b-nav-item
                v-for="navItem in navItems[this.selectedView] ? navItems[this.selectedView].children : []"
                :key="navItem.url"
                :to="navItem.url"
                v-if="checkUserFunction(navItem.permissions)"
            >{{ navItem[locale] }}</b-nav-item>

            <div class="text-white mx-3 font-20">|</div>
            <b-nav-item-dropdown right class="d-md-down-none">
                <template slot="button-content">
                    <i class="fa fa-user mr-1" aria-hidden="true" id="nav-profile"></i>
                    {{ currentUserDetail ? currentUserDetail.name : '' }}
                    <b-tooltip
                        target="nav-profile"
                        placement="bottom"
                    >{{ $t('topMenu.userProfile') }}</b-tooltip>
                </template>

                <!-- Dropdown -->
                <b-dropdown-item @click="openUpdateProfileInfoModal" class="bg-white">
                    <i class="fa fa-user text-primary"></i>
                    {{ $t('topMenu.updateProfile') }}
                </b-dropdown-item>
                <b-dropdown-item @click="openChangePassModal" class="bg-white">
                    <i class="fa fa-wrench text-primary"></i>
                    {{ $t('topMenu.changePassword') }}
                </b-dropdown-item>
                <b-dropdown-item @click="openSettingModal" class="bg-white">
                    <i class="fa fa-cog text-primary"></i>
                    {{ $t('topMenu.setttings') }}
                </b-dropdown-item>
                <b-dropdown-item @click="openAboutModal" class="bg-white">
                    <i class="fa fa-globe text-primary"></i>
                    {{ $t('topMenu.about') }}
                </b-dropdown-item>
                <b-dropdown-divider></b-dropdown-divider>
                <b-dropdown-item @click="logout" class="bg-white">
                    <i class="fa fa-sign-out text-primary"></i>
                    {{ $t('topMenu.logout') }}
                </b-dropdown-item>
            </b-nav-item-dropdown>

            <div class="text-white mx-3 font-20">|</div>
            <b-nav-item-dropdown right class="d-md-down-none">
                <template slot="button-content">
                    <i
                        v-if="selectedView"
                        :class="navItems[selectedView].iconClass"
                        class="mr-1"
                        aria-hidden="true"
                        id="view-change"
                    ></i>
                    <b-tooltip
                        target="view-change"
                        placement="bottom"
                    >{{ $t('topMenu.changeView') }}</b-tooltip>
                </template>

                <!-- Dropdown -->
                <b-dropdown-item
                    @click="changeView(view)"
                    class="bg-white"
                    v-for="view in Object.keys(navItems)"
                    :active="view === selectedView"
                >
                    <i :class="navItems[view].iconClass" class="text-dark" aria-hidden="true"></i>
                    {{ navItems[view].name[locale] }}
                </b-dropdown-item>
            </b-nav-item-dropdown>
        </b-navbar-nav>

        <!-- the modal -->
        <!-- Update profile modal -->
        <b-modal
            ref="updateProfileInfo"
            :title="$t('updateProfileModal.title')"
            no-close-on-esc
            no-close-on-backdrop
            :cancel-title="$t('common.cancel')"
            @ok="handleUpdateProfileOk"
        >
            <form @submit.prevent="submitUpdateProfileForm">
                <b-form-group :label="$t('updateProfileModal.fullName')">
                    <b-form-input
                        maxlength="255"
                        v-model="profileInfo.name"
                        :placeholder="$t('updateProfileModal.fullName')"
                        name="fullName"
                        v-validate="'required'"
                        :data-vv-as="$t('updateProfileModal.fullName')"
                    ></b-form-input>
                    <div
                        v-show="errors.has('fullName')"
                        class="validation-message text-danger"
                    >{{ errors.first('fullName') }}</div>
                </b-form-group>

                <b-form-group :label="$t('updateProfileModal.phone')">
                    <b-form-input
                        maxlength="255"
                        v-model="profileInfo.phone"
                        :placeholder="$t('updateProfileModal.phone')"
                        name="phone"
                        v-validate="'required'"
                        :data-vv-as="$t('updateProfileModal.phone')"
                    ></b-form-input>
                    <div
                        v-show="errors.has('phone')"
                        class="validation-message text-danger"
                    >{{ errors.first('phone') }}</div>
                </b-form-group>
            </form>
        </b-modal>

        <!-- Change password modal -->
        <b-modal
            ref="changePassModal"
            :title="$t('changePassModal.title')"
            no-close-on-esc
            no-close-on-backdrop
            :cancel-title="$t('common.cancel')"
            @ok="handleChangePassOk"
        >
            <form @submit.prevent="submitChangePassForm">
                <b-form-group :label="$t('changePassModal.currentPass')">
                    <b-form-input
                        maxlength="255"
                        v-model.trim="changePassInfo.oldPassword"
                        :placeholder="$t('changePassModal.currentPass')"
                        name="oldPassword"
                        v-validate="'required'"
                        :data-vv-as="$t('changePassModal.currentPass')"
                        type="password"
                        autocomplete="off"
                    ></b-form-input>
                    <div
                        v-show="errors.has('oldPassword')"
                        class="validation-message text-danger"
                    >{{ errors.first('oldPassword') }}</div>
                </b-form-group>

                <b-form-group :label="$t('changePassModal.newPass')">
                    <b-form-input
                        maxlength="255"
                        v-model.trim="changePassInfo.newPassword"
                        :placeholder="$t('changePassModal.newPass')"
                        name="newPassword"
                        v-validate="'required'"
                        :data-vv-as="$t('changePassModal.newPass')"
                        type="password"
                        ref="newPassword"
                        autocomplete="off"
                    ></b-form-input>
                    <div
                        v-show="errors.has('newPassword')"
                        class="validation-message text-danger"
                    >{{ errors.first('newPassword') }}</div>
                </b-form-group>

                <b-form-group :label="$t('changePassModal.confirmedPass')">
                    <b-form-input
                        maxlength="255"
                        v-model.trim="confirmedPassword"
                        :placeholder="$t('changePassModal.confirmedPass')"
                        name="confirmedPassword"
                        v-validate="'required|confirmed:newPassword'"
                        :data-vv-as="$t('changePassModal.confirmedPass')"
                        type="password"
                        autocomplete="off"
                    ></b-form-input>
                    <div
                        v-show="errors.has('confirmedPassword')"
                        class="validation-message text-danger"
                    >{{ errors.first('confirmedPassword') }}</div>
                </b-form-group>
            </form>
        </b-modal>

        <!-- Setting modal -->
        <b-modal
            ref="settingModal"
            :title="$t('settingModal.title')"
            no-close-on-esc
            no-close-on-backdrop
            :cancel-title="$t('common.cancel')"
            @ok="handleSettingOk"
        >
            <form @submit.prevent="submitSettingForm">
                <b-form-group :label="$t('settingModal.language')">
                    <b-form-radio-group
                        v-model="userOptionsState.language"
                        name="language"
                        v-validate="'required'"
                        :data-vv-as="$t('settingModal.language')"
                    >
                        <b-row>
                            <b-col>
                                <b-form-radio value="vi" class="d-flex align-items-center">
                                    <img src="/static/img/vi.png" class="mr-2" /> Tiếng Việt
                                </b-form-radio>
                            </b-col>
                            <b-col>
                                <b-form-radio value="en" class="d-flex align-items-center">
                                    <img src="/static/img/us.png" class="mr-2" /> English
                                </b-form-radio>
                            </b-col>
                        </b-row>
                    </b-form-radio-group>
                    <div
                        v-show="errors.has('language')"
                        class="validation-message text-danger"
                    >{{ errors.first('language') }}</div>
                </b-form-group>

                <b-form-group :label="$t('settingModal.timezone')">
                    <b-form-select
                        v-model="userOptionsState.timezone"
                        :options="CONSTANTS.TIMEZONES"
                        name="timezone"
                        v-validate="'required'"
                        :data-vv-as="$t('settingModal.timezone')"
                    ></b-form-select>
                    <div
                        v-show="errors.has('timezone')"
                        class="validation-message text-danger"
                    >{{ errors.first('timezone') }}</div>
                </b-form-group>
            </form>
        </b-modal>
        <!-- About system -->
        <b-modal
            ref="aboutModal"
            :title="$t('aboutModal.title')"
            :cancel-title="$t('aboutModal.cancel')"
            :hide-footer= true
        >
                <b-form-group :label="$t('aboutModal.created')">
                    <div><h5 style="color: red">{{ $t('aboutModal.createdAt') }}</h5></div>
                    
                </b-form-group>
                <b-form-group :label="$t('aboutModal.name')">
                    <div><h5 style="color: red">{{ $t('aboutModal.version') }}</h5></div>
                    
                </b-form-group>
                <b-form-group :label="$t('aboutModal.api')">
                    <div><h5 style="color: red">{{ $t('aboutModal.version') }}</h5></div>
                    
                </b-form-group>
                <b-form-group :label="$t('aboutModal.service')">
                    <div><h5 style="color: red">{{ $t('aboutModal.version') }}</h5></div>
                    
                </b-form-group>
        </b-modal>

    </header>
</template>
<script>
import { mapActions, mapState } from 'vuex';
import _ from 'lodash';
import CONSTANTS from '../constants';
import moment from 'moment-timezone';
import { i18n } from '../main';
import { Validator } from 'vee-validate';
import vi from 'vee-validate/dist/locale/vi';
// import navItemsDefaul from '@/nav';
// import axios from 'axios';

export default {
    components: {},
    mounted: function() {
        // this.data.navItems = navItemsDefaul;
        this.$nextTick(async function() {
            this.getCurrentUserDetail();

            this.onRouteChange();
        });
    },
    data() {
        return {
            CONSTANTS,
            changePassInfo: {},
            profileInfo: {
                name: '',
                phone: ''
            },
            cache: null,
            confirmedPassword: null,
            userOptionsState: {},
            selectedView: null
        };
    },
    computed: {
        ...mapState({
            currentUserDetail: state => _.cloneDeep(_.get(state.auth, 'currentUser.userDetail')),
            currentUser: state => _.cloneDeep(state.auth.currentUser)
        }),
        locale() {
            return i18n.locale;
        },
        navItems() {
            // return this.cache;
            // console.log('Get Menu');
            // var tmp = await axios.get('http://127.0.0.1/static/api/nav.js');
            // console.log(tmp.data);
            // console.log(tmp.data.analyzeNav.viewName);
            // console.log(this.$root.nav);
            // console.log(this.$root.nav.analyzeNav.viewName);
            // console.log('&&&&&&&&&&&&&&&&&&&&&&');
            // console.log('&&&&&&&&&&&&&&&&&&&&&&');
            // console.log('&&&&&&&&&&&&&&&&&&&&&&');
            // console.log('&&&&&&&&&&&&&&&&&&&&&&');
            return this.$root.nav;
            // .then(response => {
            //     this.navItems = response.data;
            //     console.log('&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&');
            //     console.log(this.navItems);
            // });
        }
    },
    watch: {
        currentUserDetail(value) {
            this.userOptionsState = _.get(value, 'options', {
                language: 'vi',
                timezone: 'Asia/Saigon'
            });
            this.applyUserOptions(this.userOptionsState);
        },
        $route(val) {
            this.onRouteChange();
        }
    },
    methods: {
        ...mapActions({
            getCurrentUserDetail: 'auth/getCurrentUserDetail',
            actionLogout: 'auth/actionLogout',
            actionChangePass: 'auth/actionChangePass',
            updateCurrentUserOptions: 'auth/updateCurrentUserOptions',
            updateProfileInfo: 'user/updateUserInfo',
            updateAuthState: 'auth/updateState'
        }),
        logout: function() {
            this.actionLogout().then(() => {
                this.$router.push('/login');
            });
        },
        // Change password
        openChangePassModal() {
            // Reset form
            this.changePassInfo = {};
            this.confirmedPassword = null;

            this.$refs.changePassModal.show();
        },

        handleChangePassOk(modal) {
            // Prevent modal from closing
            modal.preventDefault();
            // Trigger submit handler
            this.submitChangePassForm();
        },
        submitChangePassForm: function() {
            this.$validator.validateAll().then(result => {
                if (result) {
                    this.actionChangePass(this.changePassInfo).then(() => {
                        this.$refs.changePassModal.hide();
                        this.$toaster.success(this.$t('changePassModal.changePassSuccessMsg'));
                    });
                }
            });
        },

        // Update Profile
        openUpdateProfileInfoModal() {
            // Reset form
            this.profileInfo = { ...this.currentUserDetail };
            this.$refs.updateProfileInfo.show();
        },
        handleUpdateProfileOk(modal) {
            // Prevent modal from closing
            modal.preventDefault();
            // Trigger submit handler
            this.submitUpdateProfileForm();
        },
        submitUpdateProfileForm: function() {
            this.$validator.validateAll().then(result => {
                if (result) {
                    this.updateProfileInfo(this.profileInfo).then(() => {
                        this.$refs.updateProfileInfo.hide();
                        this.$toaster.success(
                            this.$t('updateProfileModal.updateProfileSuccessMsg')
                        );
                        const currentUser = JSON.parse(localStorage.getItem('currentUser'));
                        currentUser.userDetail = { ...this.profileInfo };
                        localStorage.setItem('currentUser', JSON.stringify(currentUser));
                        this.getCurrentUserDetail();
                    });
                }
            });
        },

        // User options
        openSettingModal: async function() {
            this.$refs.settingModal.show();
        },
        openAboutModal: async function() {
            this.$refs.aboutModal.show();
        },
        handleSettingOk(modal) {
            // Prevent modal from closing
            modal.preventDefault();
            // Trigger submit handler
            this.submitSettingForm();
        },
        submitSettingForm: function() {
            this.$validator.validateAll().then(result => {
                if (result) {
                    this.updateCurrentUserOptions({
                        id: this.currentUserDetail.id,
                        options: this.userOptionsState
                    }).then(() => {
                        this.$refs.settingModal.hide();
                        this.$toaster.success(this.$t('settingModal.saveSettingSuccessMsg'));
                        // this.$router.go();
                    });
                }
            });
        },
        applyUserOptions(userOptions) {
            // Set timezone
            const timezoneValue = _.get(userOptions, 'timezone');
            moment.tz.setDefault(timezoneValue);

            // Set locale
            const lang = _.get(userOptions, 'language', 'vi');
            i18n.locale = lang;

            if (lang === 'vi') {
                Validator.localize('vi', {
                    messages: vi.messages
                });
            } else {
                Validator.localize('en');
            }
        },
        checkUserFunction(functionList) {
            // const userFunctions = _.get(this.currentUserDetail, 'functions');
            // let hasPermission = false;
            // if (userFunctions) {
            //     functionList.forEach(functionName => {
            //         hasPermission = hasPermission || userFunctions.indexOf(functionName) > -1;
            //     });
            //     return hasPermission;
            // }
            // TODO: revert this when user functions are ready from back-end side
            return true;
        },
        changeView(view) {
            this.selectedView = view;
            this.$router.push(`/home?view=${view}`);
            this.updateAuthState({
                stateName: 'currentUser',
                value: { ...this.currentUser, selectedView: view }
            });
        },
        onRouteChange() {
            Object.keys(this.navItems).forEach(view => {
                // TODO: find better way to check 2 routes matching
                const index = this.navItems[view].children.findIndex(
                    navItem => this.$route.path.indexOf(navItem.url) > -1
                );
                if (index > -1) {
                    this.selectedView = view;
                    this.updateAuthState({
                        stateName: 'currentUser',
                        value: { ...this.currentUser, selectedView: view }
                    });
                    return;
                }
            });
        }
    }
};
</script>


