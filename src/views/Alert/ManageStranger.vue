<template>
    <div class="animated fadeIn h-100">
        <sub-header hideBreadcrumb>
            <template slot="sub-header-left">
                <b-navbar-nav class="d-flex flex-row">
                    <b-nav-item to="/alert/manage/profile" class="text-nowrap">{{
                        $t('alert.manage.profile')
                    }}</b-nav-item>
                    <b-nav-item to="/alert/manage/thief" class="text-nowrap">{{
                        $t('alert.manage.thief')
                    }}</b-nav-item>
                    <b-nav-item to="/alert/manage/stranger" class="text-nowrap">{{
                        $t('attendanceCommon.manage.stranger')
                    }}</b-nav-item>
                    <b-nav-item to="/alert/manage/region" class="text-nowrap">{{
                        $t('alert.manage.region')
                    }}</b-nav-item>
                    <b-nav-item to="/alert/manage/monitor" class="text-nowrap">{{
                        $t('alert.manage.monitor')
                    }}</b-nav-item>
                </b-navbar-nav>
            </template>
            <template slot="sub-header-middle"></template>
        </sub-header>
        <div class="page-content sub-header-page-content pb-2">
            <div class="d-flex h-100">
                <div class="h-100 overflow-hidden flex-1 d-flex flex-column">
                    <div v-if="!isLoading" class="overflow-y-scroll masonry-with-columns flex-1">
                        <b-row class="mx-0 w-100 mt-xl-2">
                            <b-col
                                cols="4"
                                lg="2"
                                xl="1"
                                class="mb-xl-2 px-xl-1 mb-4"
                                v-for="(item, index) in items"
                                :key="index"
                            >
                                <StrangerItem
                                    :data="item"
                                    @delete="confirmDelete(item.name)"
                                    @addNew="addNewProfile(item.name)"
                                />
                            </b-col>
                            <b-col cols="12" class="text-center mt-2 mb-3">
                                <b-button
                                    variant="outline-primary"
                                    @click="loadMore"
                                    v-if="items.length > 0"
                                >
                                    <span>{{ $t('alert.loadMore') }}</span>
                                    <i class="ml-2 fa fa-chevron-down"></i>
                                </b-button>
                                <span v-if="items.length === 0">{{
                                    $t('attendanceStranger.noRecord')
                                }}</span>
                            </b-col>
                        </b-row>
                    </div>
                    <div
                        v-if="isLoading"
                        class="h-100 d-flex flex-column justify-content-center align-items-center"
                    >
                        <img src="/static/img/loader-green.gif" class="standalone-loading" />
                    </div>
                </div>
                <div class="case-detail_sidebar h-100">
                    <StrangerFilter :cameras="cameras" @filterChange="filterChange" />
                </div>
            </div>
        </div>

        <!-- Create Profile Modal -->
        <b-modal
            ref="createModal"
            :title="$t('profile.createProfile')"
            :ok-title="$t('common.create')"
            :cancel-title="$t('common.cancel')"
            @ok="handleOk"
            no-close-on-esc
            no-close-on-backdrop
        >
            <b-row>
                <b-col md="12">
                    <b-row>
                        <b-col md="9">
                            <b-form-group :label="$t('user.fullName')">
                                <b-form-input
                                    maxlength="255"
                                    v-model="form.name"
                                    v-validate="'required'"
                                    :placeholder="$t('user.fullName')"
                                    name="name"
                                    :data-vv-as="$t('user.fullName')"
                                ></b-form-input>
                                <div
                                    v-show="errors.has('name')"
                                    class="validation-message text-danger"
                                >
                                    {{ errors.first('name') }}
                                </div>
                            </b-form-group>
                        </b-col>
                        <b-col md="3" class="align-self-center mt-4">
                            <b-form-group>
                                <b-form-checkbox id="follow-checkbox" v-model="form.active">
                                    <b-badge
                                        class="text-uppercase font-13 cursor-pointer"
                                        variant="warning"
                                        >{{ $t('profile.follow') }}</b-badge
                                    >
                                </b-form-checkbox>
                            </b-form-group>
                        </b-col>
                    </b-row>

                    <b-row>
                        <b-col md="12">
                            <b-form-group :label="$t('user.type')">
                                <b-form-select v-model="type" :options="listType"></b-form-select>
                            </b-form-group>
                        </b-col>
                        <b-col md="6">
                            <b-form-group :label="$t('user.group')">
                                <vue-simple-suggest
                                    v-model="form.group"
                                    :list="listGroup"
                                    :styles="autoCompleteStyle"
                                    :filter-by-query="true"
                                    :placeholder="$t('user.group')"
                                ></vue-simple-suggest>
                            </b-form-group>
                        </b-col>
                        <b-col md="6">
                            <b-form-group :label="$t('profile.code')">
                                <b-form-input
                                    maxlength="255"
                                    v-model="form.number"
                                    :placeholder="$t('profile.code')"
                                ></b-form-input>
                            </b-form-group>
                        </b-col>
                    </b-row>

                    <b-form-group :label="`${$t('common.description')} ${$t('common.optional')}`">
                        <b-form-input
                            maxlength="255"
                            v-model="form.desc"
                            :placeholder="$t('common.description')"
                        ></b-form-input>
                    </b-form-group>

                    <b-form-group
                        :label="`${$t('attendanceGuest.welcomeMess')} ${$t('common.optional')}`"
                        v-if="type === 'guest'"
                    >
                        <b-form-input
                            maxlength="255"
                            v-model="welcomeMess"
                            :placeholder="$t('attendanceGuest.welcomeMess')"
                        ></b-form-input>
                    </b-form-group>

                    <b-form-group
                        :label="`${$t('attendanceGuest.byeMess')} ${$t('common.optional')}`"
                        v-if="type === 'guest'"
                    >
                        <b-form-input
                            maxlength="255"
                            v-model="byeMess"
                            :placeholder="$t('attendanceGuest.byeMess')"
                        ></b-form-input>
                    </b-form-group>
                </b-col>
            </b-row>
        </b-modal>

        <!-- Confirm Delete Item -->
        <b-modal
            ref="confirmDeleteModal"
            :title="$t('common.confirmation')"
            no-close-on-esc
            no-close-on-backdrop
            :ok-title="$t('common.delete')"
            :cancel-title="$t('common.cancel')"
            ok-variant="danger"
            @ok="onDelete"
            >{{ $t('attendanceStranger.confirmDelete') }}</b-modal
        >
    </div>
</template>

<script>
import { mapActions, mapState } from 'vuex';
import StrangerItem from '@/components/StrangerItem.vue';
import StrangerFilter from '@/components/StrangerFilter';
import moment from 'moment';
import VueSimpleSuggest from 'vue-simple-suggest';
import 'vue-simple-suggest/dist/styles.css';

export default {
    components: {
        StrangerItem,
        StrangerFilter,
        VueSimpleSuggest
    },
    mounted: function() {
        this.$nextTick(function() {
            this.initData();
        });
    },
    data: function() {
        return {
            filter: {},
            isLoading: true,
            currentItemName: '',
            form: {
                id: null,
                name: '',
                desc: '',
                number: '',
                group: '',
                active: false
            },
            autoCompleteStyle: {
                suggestItem: 'text-dark bg-white'
            },
            listGroup: [],
            listType: [
                { value: 'guest', text: this.$t('attendanceCommon.manage.guest') },
                { value: 'staff', text: this.$t('attendanceCommon.manage.staff') },
                { value: 'suspect', text: this.$t('attendanceCommon.manage.suspect') }
            ],
            welcomeMess: '',
            byeMess: '',
            type: 'guest'
        };
    },
    computed: {
        ...mapState({
            items: state => state.stranger.items,
            cameras: state => state.camera.items,
            listProfiles: state => state.profile.items
        })
    },
    methods: {
        ...mapActions({
            getNewestStrangerList: 'stranger/getNewestStrangerList',
            getNewestStrangerListReplace: 'stranger/getNewestStrangerListReplace',
            deleteItem: 'stranger/deleteItem',
            addNew: 'stranger/addNewProfile',
            getListCameras: 'camera/getList',
            getListProfiles: 'profile/getList',
            updateOrCreate: 'profile/updateOrCreate'
        }),
        async initData() {
            this.getNewestStrangerListReplace({
                count: 120,
                ...this.filter
            }).then(() => {
                this.isLoading = false;
            });
            this.getListCameras();
            await this.getListProfiles({
                type: 'guest'
            });
            this.listProfiles.forEach(element => {
                if (this.listGroup.indexOf(element.group) === -1) {
                    this.listGroup.push(element.group);
                }
            });
        },
        loadMore() {
            this.getNewestStrangerList({
                from: this.items[this.items.length - 1].name,
                count: 120,
                to: this.filter.to,
                cameraId: this.filter.cameraId
            }).then(res => {
                if (res.length === 0) {
                    this.$toaster.info(this.$i18n.t('attendanceStranger.noMoreRecord'));
                }
            });
        },
        filterChange(filter) {
            this.filter = { ...filter };
            for (const field in this.filter) {
                if (this.filter[field] === 'all') {
                    this.filter[field] = null;
                }
            }
            if (this.filter.from && this.filter.from !== '') {
                const data = moment(this.filter.from, 'DD/MM/YYYY HH:mm');
                this.filter.from = moment(data).format('YYYY-MM-DD_HH:mm');
            } else this.filter.from = null;

            if (this.filter.to && this.filter.to !== '') {
                const data = moment(this.filter.to, 'DD/MM/YYYY HH:mm');
                this.filter.to = moment(data).format('YYYY-MM-DD_HH:mm');
            } else this.filter.to = null;

            this.isLoading = true;

            this.getNewestStrangerListReplace({
                count: 120,
                ...this.filter
            }).then(() => {
                this.isLoading = false;
            });
        },
        confirmDelete(name) {
            this.currentItemName = name;
            this.$refs.confirmDeleteModal.show();
        },
        async onDelete(modal) {
            modal.preventDefault();
            this.deleteItem({ id: this.currentItemName }).then(() => {
                this.$toaster.success(this.$t('profile.deleteImgMess'));
                this.$refs.confirmDeleteModal.hide();
            });
        },
        addNewProfile(data) {
            this.currentItemName = data;
            this.resetForm();
            this.$refs.createModal.show();
        },
        resetForm() {
            this.form = {};
            this.form.active = false;
            this.form.group = '';
            this.welcomeMess = '';
            this.byeMess = '';
            this.type = 'guest';
        },
        async handleOk(modal) {
            modal.preventDefault();
            this.onSubmit();
        },
        onSubmit() {
            this.$validator.validateAll().then(result => {
                if (result && this.form.group && this.form.group !== '') {
                    this.submitForm();
                } else this.$toaster.error(this.$t('profile.groupErrorMess'));
            });
        },
        async submitForm() {
            const data = { welcomeMessage: this.welcomeMess, byeMessage: this.byeMess };
            this.form.data = JSON.stringify(data);

            await this.updateOrCreate({ ...this.form, type: this.type });
            this.addNew({
                id: this.listProfiles[this.listProfiles.length - 1].id,
                name: this.currentItemName
            });
            this.$refs.createModal.hide();
            this.$toaster.success(
                `${this.$i18n.t('common.create')} ${this.$i18n.t('profile.profileSuccess')}`
            );
        }
    }
};
</script>
<style lang="scss"></style>
