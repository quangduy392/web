<template>
    <div class="animated fadeIn h-100">
        <sub-header :breadcrumbSubfix="item.name">
            <template slot="sub-header-left">
                <b-navbar-nav class="d-flex flex-row">
                    <b-nav-item :to="`/analyze-case/${caseId}/viewer`">
                        {{ $t('caseDetail.viewer') }}
                    </b-nav-item>
                    <b-nav-item :to="`/analyze-case/${caseId}/report`">
                        {{ $t('caseDetail.report') }}
                    </b-nav-item>
                    <b-nav-item :to="`/analyze-case/${caseId}/status`">
                        {{ $t('caseDetail.status') }}
                    </b-nav-item>
                </b-navbar-nav>
            </template>
            <template slot="sub-header-middle"></template>
            <template slot="sub-header-right">
                <b-button
                    variant="link"
                    class="bg-none text-uppercase text-gray-300"
                    @click="openDeleteCaseModal"
                >
                    <i class="fa fa-trash mr-1" aria-hidden="true"></i>
                    {{ $t('cases.deleteCase') }}
                </b-button>

                <b-button
                    variant="outline-primary"
                    class="bg-none text-uppercase"
                    @click="openCreateOrUpdateCaseModal"
                >
                    <i class="fa fa-pencil mr-1" aria-hidden="true"></i>
                    {{ $t('cases.editCase') }}
                </b-button>
            </template>
        </sub-header>

        <div class="page-content sub-header-page-content p-4">
            <div class="border border-gray-500 bg-gray-900 p-3 mih-100 d-flex flex-column">
                <div>
                    <h4>
                        {{ item.name }}
                        <!-- <a href="#" class="text-gray-300">
                            <i
                                class="fa fa-download cursor-pointer pull-right"
                                aria-hidden="true"
                                v-b-tooltip.hover
                                :title="$t('caseDetail.bookmark.exportReport')"
                            ></i>
                        </a> -->
                    </h4>
                    <div class="text-gray-300 small mb-4">
                        <span class="text-white">{{ $t('common.createdAt') }}: </span>
                        {{ item.createdAt | formatDateTime }} -
                        <span class="text-white">{{ $t('common.updatedAt') }}: </span>
                        {{ item.updatedAt | formatDateTime }}
                    </div>
                    <p class="text-gray-300  mb-4">{{ item.desc }}</p>

                    <hr class="border-gray-500" />
                    <h5 class="mb-3">{{ $t('caseDetail.bookmark.bookmarks') }}</h5>
                </div>

                <div
                    class="flex-1 d-flex justify-content-center align-items-center"
                    v-if="!bookmarkItems.length"
                >
                    <div class="text-muted text-center text-uppercase">
                        {{ $t('caseDetail.bookmark.noBookmark') }}
                    </div>
                </div>

                <div class="masonry-with-columns flex-1 overflow-y-auto">
                    <bookmark-item
                        v-for="item in bookmarkItems"
                        :item="item"
                        class="marsony-item mb-2"
                        :key="item.id"
                    ></bookmark-item>
                </div>
            </div>
        </div>

        <!-- Create or update case modal -->
        <b-modal
            ref="createOrUpdateCaseModal"
            :title="$t('cases.updateCase')"
            no-close-on-esc
            no-close-on-backdrop
            @ok="handleCreateCaseOk"
            :ok-title="$t('common.update')"
            :cancel-title="$t('common.cancel')"
        >
            <form @submit.prevent="submitCreateCaseForm" v-if="caseItem">
                <b-form-group :label="$t('cases.createCaseTitle')">
                    <b-form-input
                        maxlength="255"
                        v-model.trim="caseItem.name"
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
                        v-model="caseItem.desc"
                        :placeholder="$t('cases.createCaseDescription')"
                        rows="3"
                        max-rows="6"
                    >
                    </b-form-textarea>
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
        >
            <span v-if="caseItem">{{
                $t('cases.deleteConfirmMsg', { caseName: caseItem.name })
            }}</span>
        </b-modal>
    </div>
</template>

<script>
import { mapActions, mapState } from 'vuex';
import CONSTANTS from '@/constants';
import BookmarkItem from '@/components/BookmarkItem';

export default {
    name: 'case-report',
    components: {
        BookmarkItem
    },
    mounted() {
        this.$nextTick(function() {
            if (this.caseId) {
                this.resetAnalyzeCaseData();
                this.getaAnalyzeCaseDetail({
                    id: this.caseId
                });

                this.resetBookmarkData();
                this.getBookmarkList({
                    caseId: this.caseId
                });
            }
        });
    },
    data() {
        return {
            CONSTANTS,
            caseId: this.$route.params.id,
            caseItem: null
        };
    },
    computed: {
        ...mapState({
            item: state => state.analyzeCase.item,
            bookmarkItems: state => state.bookmark.items
        })
    },
    watch: {
        item(value) {
            this.caseItem = _.cloneDeep(value);
        }
    },
    methods: {
        ...mapActions({
            resetAnalyzeCaseData: 'analyzeCase/resetData',
            getaAnalyzeCaseDetail: 'analyzeCase/getDetail',
            resetBookmarkData: 'bookmark/resetData',
            getBookmarkList: 'bookmark/getList',
            updateOrCreateAnalyzeCase: 'analyzeCase/updateOrCreate',
            deleteAnalyzeCase: 'analyzeCase/delete'
        }),

        // update case modal
        openCreateOrUpdateCaseModal(item) {
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
                    this.updateOrCreateAnalyzeCase(this.caseItem).then(() => {
                        this.$refs.createOrUpdateCaseModal.hide();
                        this.$toaster.success(this.$t('cases.updateCaseSuccessMsg'));
                    });
                }
            });
        },

        // Delete case modal
        openDeleteCaseModal(item) {
            this.$refs.deleteCaseModal.show();
        },
        handleDeleteCaseOk(modal) {
            // Prevent modal from closing
            modal.preventDefault();
            // Trigger submit handler
            this.deleteAnalyzeCase(this.caseItem).then(() => {
                this.$refs.deleteCaseModal.hide();
                this.$toaster.success(this.$t('cases.deleteCaseSuccessMsg'));
                this.$router.replace('/analyze-case');
            });
        }
    }
};
</script>

<style lang="scss" scoped></style>
