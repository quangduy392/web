<template>
    <div class="animated fadeIn h-100">
        <sub-header hideBreadcrumb>
            <template slot="sub-header-left">
                <b-navbar-nav class="d-flex flex-row">
                    <b-nav-item :to="`/analyze-case`">{{ $t('cases.cases') }}</b-nav-item>
                </b-navbar-nav>
            </template>
            <template slot="sub-header-middle"></template>
            <template slot="sub-header-right">
                <div class="d-flex align-items-center">
                    <div class="input-group border-bottom position-relative">
                        <input
                            type="text"
                            class="form-control bg-transparent border-none text-white pr-4"
                            :placeholder="$t('common.search')"
                            aria-label="Search"
                            aria-describedby="button-addon2"
                            v-model="searchKeyword"
                            @input="doSearch"
                            style="min-width: 190px;"
                        />
                        <i
                            class="fa fa-search position-absolute"
                            aria-hidden="true"
                            style="top: 50%;right: 4px;margin-top: -6px;"
                        ></i>
                    </div>
                    <div class="text-white mx-3 font-20">|</div>
                    <div class="d-flex align-items-center text-nowrap">
                        <span class="text-muted mr-2 text-gray-300"
                            >{{ $t('common.sortBy') }}:</span
                        >
                        <a
                            href="javascript:void(0)"
                            class="text-decoration-none"
                            :class="{
                                'text-white': sortBy == 'createdAt',
                                'text-gray-300 ': sortBy != 'createdAt'
                            }"
                            @click="doSort('createdAt')"
                            >{{ $t('common.lastCreated') }}</a
                        >
                        <span class="text-white mx-2">-</span>
                        <a
                            href="javascript:void(0)"
                            class="text-decoration-none"
                            :class="{
                                'text-white': sortBy == 'updatedAt',
                                'text-gray-300 ': sortBy != 'updatedAt'
                            }"
                            @click="doSort('updatedAt')"
                            >{{ $t('common.lastUpdated') }}</a
                        >
                    </div>
                    <div class="text-white mx-3 font-20">|</div>
                    <div class="d-flex align-items-center text-nowrap text-uppercase">
                        <b-button
                            variant="outline-primary"
                            class="bg-none text-uppercase"
                            @click="openCreateOrUpdateCaseModal"
                        >
                            <i class="fa fa-plus-circle mr-1" aria-hidden="true"></i>
                            {{ $t('cases.createCase') }}
                        </b-button>
                    </div>
                </div>
            </template>
        </sub-header>

        <div class="page-content sub-header-page-content py-3 px-4">
            <b-row v-if="displayedItems.length">
                <template v-for="(caseItem, index) in displayedItems">
                    <!-- <div
                        class="w-100"
                        v-if="index % CONSTANTS.CASE_LIST_PER === 0"
                        :class="{ 'mb-4': index > 0 }"
                    ></div>-->
                    <b-col
                        cols="12"
                        md="4"
                        lg="3"
                        xl="2"
                        class="mb-4 mb-xl-2 px-xl-1"
                        :key="getCaseItemKey(caseItem)"
                    >
                        <CaseItem
                            :caseItem="caseItem"
                            @editCase="openCreateOrUpdateCaseModal(caseItem)"
                            @deleteCase="openDeleteCaseModal(caseItem)"
                            @addVideo="openAddVideoModal(caseItem)"
                        ></CaseItem>
                    </b-col>
                </template>
                <!-- Buffer case items to make all cols have same width -->
                <b-col v-for="(i, index) in bufferItems"></b-col>
            </b-row>

            <div
                v-if="!displayedItems.length && !isShowLoading"
                class="h-100 d-flex flex-column justify-content-center align-items-center"
            >
                <div class="mb-3 strong font-16">{{ $t('cases.noCase') }}</div>
                <b-button
                    variant="outline-primary"
                    class="bg-none text-uppercase"
                    @click="openCreateOrUpdateCaseModal"
                >
                    <i class="fa fa-plus-circle mr-1" aria-hidden="true"></i>
                    {{ $t('cases.createCase') }}
                </b-button>
            </div>

            <div
                v-if="!displayedItems.length && isShowLoading"
                class="h-100 d-flex flex-column justify-content-center align-items-center"
            >
                <img src="/static/img/loader-green.gif" class="standalone-loading" />
            </div>
        </div>

        <!-- the modal -->
        <!-- Create or update case modal -->
        <b-modal
            ref="createOrUpdateCaseModal"
            :title="selectedItem.id ? $t('cases.updateCase') : $t('cases.createCase')"
            no-close-on-esc
            no-close-on-backdrop
            @ok="handleCreateCaseOk"
            :ok-title="selectedItem.id ? $t('common.update') : $t('common.create')"
            :cancel-title="$t('common.cancel')"
        >
            <form @submit.prevent="submitCreateCaseForm" autocomplete="off">
                <b-form-group :label="$t('cases.createCaseTitle')">
                    <b-form-input
                        maxlength="255"
                        v-model.trim="selectedItem.name"
                        :placeholder="$t('cases.createCaseTitle')"
                        name="name"
                        v-validate="'required'"
                        :data-vv-as="$t('cases.createCaseTitle')"
                    ></b-form-input>
                    <div v-show="errors.has('name')" class="validation-message text-danger">
                        {{ errors.first('name') }}
                    </div>
                </b-form-group>

                <b-form-group
                    :label="`${$t('cases.createCaseDescription')} ${$t('common.optional')}`"
                >
                    <b-form-textarea
                        id="textarea"
                        maxlength="255"
                        v-model="selectedItem.desc"
                        :placeholder="$t('cases.createCaseDescription')"
                        rows="3"
                        max-rows="6"
                    ></b-form-textarea>
                </b-form-group>
            </form>
        </b-modal>

        <!-- Delete confirmation -->
        <b-modal
            ref="deleteCaseModal"
            :title="$t('common.confirmation')"
            no-close-on-esc
            no-close-on-backdrop
            @ok="handleDeleteCaseOk"
            :ok-title="$t('common.delete')"
            :cancel-title="$t('common.cancel')"
            ok-variant="danger"
            >{{ $t('cases.deleteConfirmMsg', { caseName: selectedItem.name }) }}</b-modal
        >

        <AddVideoToCaseModal
            :caseItemId="selectedItem.id"
            @addVideoToCaseSuccess="fetchAnalyzeCaseList"
        />
    </div>
</template>

<script>
import { mapActions, mapState } from 'vuex';
import CONSTANTS from '../../constants';
import CaseItem from '../../components/CaseItem';
import { setInterval, clearInterval } from 'timers';
import _ from 'lodash';
import moment from 'moment-timezone';
import AddVideoToCaseModal from '@/components/AddVideoToCase/AddVideoToCaseModal';

export default {
    components: {
        CaseItem,
        AddVideoToCaseModal
    },
    mounted: function() {
        this.$nextTick(function() {
            this.resetaAnalyzeCaseData();
            this.fetchAnalyzeCaseList(true);
        });
    },
    data: function() {
        return {
            CONSTANTS,
            text: '',
            selectedItem: {},
            isShowLoading: false,
            analyzeCaseReloadInterval: null,
            searchKeyword: '',
            displayedItems: [],
            sortBy: 'createdAt'
        };
    },
    computed: {
        ...mapState({
            items: state => state.analyzeCase.items
        }),
        bufferItemCount() {
            const lastRowItemCount = this.displayedItems.length % CONSTANTS.CASE_LIST_PER;
            return lastRowItemCount === 0 ? 0 : CONSTANTS.CASE_LIST_PER - lastRowItemCount;
        },
        bufferItems() {
            return [...Array(this.bufferItemCount).keys()];
        }
    },
    watch: {
        items(newValue, oldValue) {
            this.updateList();
        }
    },
    methods: {
        ...mapActions({
            resetaAnalyzeCaseData: 'analyzeCase/resetData',
            getaAnalyzeCaseList: 'analyzeCase/getList',
            updateOrCreateAnalyzeCase: 'analyzeCase/updateOrCreate',
            deleteAnalyzeCase: 'analyzeCase/delete'
        }),
        async fetchAnalyzeCaseList(isShowLoading = false) {
            if (this.analyzeCaseReloadInterval) {
                clearInterval(this.analyzeCaseReloadInterval);
            }
            this.analyzeCaseReloadInterval = setInterval(() => {
                this.getaAnalyzeCaseList();
            }, CONSTANTS.CASE_LIST_RELOAD_INTERVAL);
            this.isShowLoading = isShowLoading;
            await this.getaAnalyzeCaseList();
            this.isShowLoading = false;
        },

        // Create case modal
        openCreateOrUpdateCaseModal(item) {
            this.selectedItem = item ? _.cloneDeep(item) : {};
            this.$refs.createOrUpdateCaseModal.show();
        },
        handleCreateCaseOk(modal) {
            // Prevent modal from closing
            modal.preventDefault();
            // Trigger submit handler
            this.submitCreateCaseForm();
        },
        submitCreateCaseForm: function() {
            this.$validator.validateAll().then(result => {
                if (result) {
                    this.updateOrCreateAnalyzeCase(this.selectedItem).then(() => {
                        this.$refs.createOrUpdateCaseModal.hide();
                        this.fetchAnalyzeCaseList();
                        this.$toaster.success(
                            this.$t(
                                this.selectedItem.id
                                    ? 'cases.updateCaseSuccessMsg'
                                    : 'cases.createCaseSuccessMsg'
                            )
                        );
                    });
                }
            });
        },

        // Delete case modal
        openDeleteCaseModal(item) {
            if (!item) return;
            this.selectedItem = item;
            this.$refs.deleteCaseModal.show();
        },
        handleDeleteCaseOk(modal) {
            // Prevent modal from closing
            modal.preventDefault();
            // Trigger submit handler
            this.deleteAnalyzeCase(this.selectedItem).then(() => {
                this.$refs.deleteCaseModal.hide();
                this.fetchAnalyzeCaseList();
                this.$toaster.success(this.$t('cases.deleteCaseSuccessMsg'));
            });
        },

        // Add video to case modal
        openAddVideoModal(item) {
            if (!item) return;
            this.selectedItem = item;
            this.$bvModal.show('add-videos-to-case-modal');
        },

        // Search and sort
        updateList() {
            this.displayedItems = this.applySearchAndFilter();
        },
        applySearchAndFilter() {
            let items = _.cloneDeep(this.items);

            // Apply search
            if (this.searchKeyword) {
                items = this.items.filter(
                    item => _.lowerCase(item.name).indexOf(_.lowerCase(this.searchKeyword)) > -1
                );
            }

            items.sort((a, b) => {
                if (moment(a[this.sortBy]).isAfter(moment(b[this.sortBy]))) {
                    return -1;
                }
                if (moment(b[this.sortBy]).isAfter(moment(a[this.sortBy]))) {
                    return 1;
                }
                return 0;
            });
            return items;
        },
        doSearch: _.debounce(function() {
            this.updateList();
        }, 500),
        doSort(sortBy = 'createdAt') {
            this.sortBy = sortBy;
            this.updateList();
        },
        getCaseItemKey(caseItem) {
            const caseVideoStatuses = caseItem.videos.map(video => video.status);
            return `${caseItem.id}-${caseVideoStatuses.join('-')}`;
        }
    },
    beforeDestroy() {
        if (this.analyzeCaseReloadInterval) {
            clearInterval(this.analyzeCaseReloadInterval);
        }
    }
};
</script>
