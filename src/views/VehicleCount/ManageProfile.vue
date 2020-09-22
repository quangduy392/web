<template>
    <div class="animated fadeIn h-100">
        <sub-header hideBreadcrumb>
            <template slot="sub-header-left">
                <b-navbar-nav class="d-flex flex-row">
                    <b-nav-item to="/vehicle-count/manage/region" class="text-nowrap">{{
                        $t('peopleCount.manage.region')
                    }}</b-nav-item>
                    <b-nav-item to="/vehicle-count/manage/profile" class="text-nowrap">{{
                        $t('profile.pageTitle')
                    }}</b-nav-item>
                    <b-nav-item to="/vehicle-count/manage/monitor" class="text-nowrap">{{
                        $t('peopleCount.manage.monitor')
                    }}</b-nav-item>
                </b-navbar-nav>
            </template>
            <template slot="sub-header-middle"></template>
            <template slot="sub-header-right">
                <div class="d-flex justify-content-end align-items-center">
                    <div class="input-group border-bottom position-relative" style="width: 190px;">
                        <input
                            type="text"
                            class="form-control bg-transparent border-none text-white pr-4"
                            aria-label="Search"
                            aria-describedby="button-addon2"
                            style="min-width: 190px;"
                            v-model="searchKeyword"
                            :placeholder="$t('common.search')"
                        />
                        <i
                            class="fa fa-search position-absolute"
                            aria-hidden="true"
                            style="top: 50%;right: 4px;margin-top: -6px;"
                        ></i>
                    </div>
                    <div class="text-white mx-3 font-20">|</div>
                    <div class="d-flex align-items-center text-nowrap">
                        <b-button variant="outline-primary" @click="openCreateModal">
                            <i class="fa fa-plus-circle mr-2"></i>
                            <span class="text-uppercase">{{ $t('profile.createProfile') }}</span>
                        </b-button>
                    </div>
                </div>
            </template>
        </sub-header>

        <div class="page-content sub-header-page-content pb-2">
            <div class="d-flex h-100">
                <!-- List plate profile -->
                <div
                    :class="[
                        'h-100 overflow-hidden flex-1 d-flex flex-column',
                        !searchResults.length ? 'justify-content-center align-items-center' : ''
                    ]"
                >
                    <div
                        v-if="searchResults.length"
                        class="overflow-y-scroll masonry-with-columns flex-1"
                    >
                        <b-row class="mx-1 w-100 mt-xl-2">
                            <template v-for="(plateProfile, index) in pagedPlateProfileItems">
                                <b-col cols="6" md="4" lg="3" xl="2" class="mb-4 mb-xl-2 px-xl-1">
                                    <PlateProfileItem
                                        :plateProfile="plateProfile"
                                        :profile="getProfileById(plateProfile.profileId)"
                                        :avatar="getAvatar(plateProfile.profileId)"
                                        @edit="onEditItem"
                                        @delete="confirmDelete"
                                    />
                                </b-col>
                            </template>
                        </b-row>
                    </div>
                    <div v-else class="strong font-16 text-muted">{{ $t('profile.empty') }}</div>
                    <r-pagination
                        v-model="currentPage"
                        :items="searchResults"
                        :per="CONSTANTS.PLATE_PROFILE_ITEM_PER"
                        @pageChanged="updatePagedItem"
                        v-if="searchResults.length"
                    ></r-pagination>
                </div>
                <!-- Profile filter -->
                <div class="case-detail_sidebar h-100">
                    <FilterSidebar
                        :plateProfileList="plateProfileList"
                        :profileList="profileList"
                        :filterGroups="filterGroups"
                        @doFilter="doFilter"
                    />
                </div>
            </div>
        </div>
        <!-- Create, edit plate profile modal -->
        <b-modal
            no-close-on-esc
            no-close-on-backdrop
            ref="my-modal"
            :title="$t('profile.createProfile')"
            @ok="handleOk"
        >
            <b-form-group :label="$t('vehicleCount.licensePlate')">
                <b-form-input
                    maxlength="255"
                    v-model="formData.number"
                    v-validate="'required'"
                    name="licensePlate"
                    :placeholder="$t('vehicleCount.licensePlate')"
                    :data-vv-as="$t('vehicleCount.licensePlate')"
                ></b-form-input>
                <div v-show="errors.has('licensePlate')" class="validation-message text-danger">
                    {{ errors.first('licensePlate') }}
                </div>
            </b-form-group>
            <b-form-group :label="$t('vehicleCount.owner')">
                <vue-simple-suggest
                    v-model="formData.profileId"
                    name="owner"
                    v-validate="'required'"
                    display-attribute="name"
                    value-attribute="id"
                    :list="profileList"
                    :styles="autoCompleteStyle"
                    :filter-by-query="true"
                    :placeholder="$t('vehicleCount.owner')"
                    :data-vv-as="$t('vehicleCount.owner')"
                    @input="onOwnerInput"
                ></vue-simple-suggest>
                <div
                    v-show="errors.has('owner') && showOwnerError"
                    class="validation-message text-danger"
                >
                    {{ errors.first('owner') }}
                </div>
            </b-form-group>
            <b-form-group :label="`${$t('alert.note')} ${$t('common.optional')}`">
                <b-form-input
                    maxlength="255"
                    v-model="formData.note"
                    :placeholder="$t('alert.note')"
                ></b-form-input>
            </b-form-group>
        </b-modal>
        <!-- Confirm Delete Profile -->
        <b-modal
            ref="confirmDeleteModal"
            :title="$t('common.confirmation')"
            no-close-on-esc
            no-close-on-backdrop
            :ok-title="$t('common.delete')"
            :cancel-title="$t('common.cancel')"
            ok-variant="danger"
            @ok="onDelete"
            >{{ $t('profile.confirmDeleteProfile') }}</b-modal
        >
    </div>
</template>

<script>
import { mapState, mapActions } from 'vuex';
import PlateProfileItem from '@/components/PlateProfile/PlateProfileItem';
import FilterSidebar from '@/components/PlateProfile/FilterSidebar';
import VueSimpleSuggest from 'vue-simple-suggest';
import 'vue-simple-suggest/dist/styles.css';
import changeAlias from '@/utils/changeAlias';
import CONSTANTS from '@/constants';
import _ from 'lodash';

export default {
    components: {
        PlateProfileItem,
        FilterSidebar,
        VueSimpleSuggest
    },
    data() {
        return {
            CONSTANTS,
            filterGroups: [],
            currentPage: 1,
            plateProfileListFilter: [],
            pagedPlateProfileItems: [],
            searchKeyword: '',
            currentPlateProfileId: null,
            formData: {},
            autoCompleteStyle: {
                suggestItem: 'text-dark bg-white'
            },
            showOwnerError: false
        };
    },
    computed: {
        ...mapState({
            plateProfileList: state => state.plateProfile.plateProfileList,
            profileList: state => state.plateProfile.profileList,
            listAllImages: state => state.profile.listAllImages
        }),
        searchResults() {
            if (this.searchKeyword) {
                return this.plateProfileListFilter.filter(profile => {
                    const keyword = changeAlias(this.searchKeyword.toLowerCase());
                    const profileName = changeAlias(profile.number.toLowerCase());
                    return profileName.indexOf(keyword) > -1;
                });
            }
            return this.plateProfileListFilter;
        }
    },
    watch: {
        plateProfileList() {
            if (this.profileList) {
                this.setFilterGroups();
            }
        },
        profileList() {
            if (this.plateProfileList) {
                this.setFilterGroups();
            }
        }
    },
    mounted() {
        this.getProfileList();
        this.getPlateProfileListAPI();
        this.getImageProfile();
    },
    methods: {
        // store
        ...mapActions({
            getProfileList: 'plateProfile/getProfileList',
            getPlateProfileList: 'plateProfile/getPlateProfileList',
            createPlateProfile: 'plateProfile/createPlateProfile',
            editPlateProfile: 'plateProfile/editPlateProfile',
            deletePlateProfile: 'plateProfile/deletePlateProfile',
            getImageProfile: 'profile/getImageProfile'
        }),

        // handle func
        setFilterGroups() {
            var filterIdGroups = _.uniq(
                this.plateProfileList.map(el => el.profileId),
                'id'
            );
            this.filterGroups = [];
            for (const id of filterIdGroups) {
                const profile = this.getProfileById(id);
                if (profile) this.filterGroups.push(profile.name);
            }
        },
        getAvatar(id) {
            const tmp = this.listAllImages.find(el => el.profileId === id && el.portrait === true);
            if (tmp) return tmp;
        },
        onOwnerInput(value) {
            if (value !== undefined) {
                this.showOwnerError = true;
            }
        },
        getProfileById(id) {
            return _.find(this.profileList, { id });
        },
        getProfileIdByName(name) {
            return _.find(this.profileList, { name }).id;
        },
        doFilter(value) {
            this.plateProfileListFilter = value;
        },
        updatePagedItem(pagedItems) {
            this.currentPage = 1;
            this.pagedPlateProfileItems = pagedItems;
        },
        resetFormData(plateProfile) {
            if (plateProfile) {
                this.currentPlateProfileId = plateProfile.id;
                this.formData = _.cloneDeep(plateProfile);
                this.formData.profileId = this.getProfileById(plateProfile.profileId).name;
            } else {
                this.currentPlateProfileId = null;
                this.formData = {};
            }
            this.showOwnerError = false;
        },
        openCreateModal() {
            this.resetFormData();
            this.$refs['my-modal'].show();
        },
        onEditItem(plateProfile) {
            this.resetFormData(plateProfile);
            this.$refs['my-modal'].show();
        },
        confirmDelete(id) {
            this.currentPlateProfileId = id;
            this.$refs.confirmDeleteModal.show();
        },
        handleOk(modal) {
            modal.preventDefault();
            this.showOwnerError = true;
            this.$validator.validateAll().then(result => {
                if (result) {
                    this.createOrEditPlateProfileAPI();
                }
            });
        },
        async onDelete(modal) {
            modal.preventDefault();
            await this.deletePlateProfile({ id: this.currentPlateProfileId });
            this.$toaster.success(this.$t('profile.deleteProfileMess'));
            this.$refs.confirmDeleteModal.hide();
            await this.getPlateProfileListAPI();
        },

        // handle API
        async getPlateProfileListAPI() {
            const response = await this.getPlateProfileList();
            this.plateProfileListFilter = response;
        },
        // create, edit API
        async createOrEditPlateProfileAPI() {
            var form = _.cloneDeep(this.formData);
            form.profileId = this.getProfileIdByName(form.profileId);
            if (form.id) {
                await this.editPlateProfile(form);
                this.$toaster.success(
                    `${this.$t('common.edit')} ${this.$t('profile.profileSuccess')}`
                );
            } else {
                await this.createPlateProfile(form);
                this.$toaster.success(
                    `${this.$t('common.create')} ${this.$t('profile.profileSuccess')}`
                );
            }
            this.$refs['my-modal'].hide();
            this.getPlateProfileListAPI();
        }
    }
};
</script>

<style lang="scss"></style>
