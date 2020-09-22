<template>
    <div class="animated fadeIn h-100">
        <sub-header :breadcrumbSubfix="caseItem.name">
            <template slot="sub-header-left">
                <b-navbar-nav class="d-flex flex-row">
                    <b-nav-item :to="`/analyze-case/${caseId}/viewer`">{{
                        $t('caseDetail.viewer')
                    }}</b-nav-item>
                    <b-nav-item :to="`/analyze-case/${caseId}/report`">{{
                        $t('caseDetail.report')
                    }}</b-nav-item>
                    <b-nav-item :to="`/analyze-case/${caseId}/status`">{{
                        $t('caseDetail.status')
                    }}</b-nav-item>
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
                    @click="$bvModal.show('add-videos-to-case-modal')"
                >
                    <i class="fa fa-plus-circle mr-1" aria-hidden="true"></i>
                    {{ $t('cases.addVideoShort') }}
                </b-button>
            </template>
        </sub-header>

        <div class="page-content sub-header-page-content p-4">
            <table class="table table-striped table-hover table-dark">
                <thead>
                    <tr>
                        <th scope="col">#</th>
                        <th scope="col">Video</th>
                        <th scope="col">{{ $t('cases.confirmFileName') }}</th>
                        <th scope="col">{{ $t('cases.confirmTitle') }}</th>
                        <th scope="col">{{ $t('cases.confirmTime') }}</th>
                        <th scope="col">{{ $t('caseDetail.statusPage.status') }}</th>
                        <th scope="col">{{ $t('common.actions') }}</th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-for="(item, index) in items" :key="`${item.id}-${item.video.status}`">
                        <th scope="row">{{ index + 1 }}</th>
                        <td>
                            <div class="case-video-thumbnail-container fix-width-sm">
                                <case-video-thumbnail
                                    rounded
                                    :video="item.video"
                                    :size="CONSTANTS.VIDEO_SNAPSHOT_SIZE.SMALL"
                                    class="border border-gray-500"
                                />
                            </div>
                        </td>
                        <td>{{ item.video.filename }}</td>
                        <td>{{ item.video.name }}</td>
                        <td>{{ item.video.time | formatDateTime }}</td>
                        <td>
                            <b-badge
                                class="text-uppercase"
                                :variant="getStatusClass(item.video.status)"
                                >{{ getStatusText(item.video.status) }}</b-badge
                            >
                        </td>
                        <td>
                            <b-button
                                variant="warning"
                                @click="openDeleteCaseVideoModal(item.id)"
                                v-b-tooltip.hover
                                class="min-width-none text-white"
                                :title="$t('caseDetail.removeVideo')"
                            >
                                <i class="fa fa-times"></i>
                            </b-button>
                            <b-button
                                variant="danger"
                                @click="openDeleteVideoModal(item.id)"
                                v-b-tooltip.hover
                                class="min-width-none"
                                :title="$t('caseDetail.deleteVideo')"
                            >
                                <i class="fa fa-trash"></i>
                            </b-button>
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>

        <!-- Remove case video confirmation -->
        <b-modal
            ref="deleteCaseVideoModal"
            :title="$t('common.confirmation')"
            no-close-on-esc
            no-close-on-backdrop
            @ok="handleDeleteCaseVideoOk"
            :ok-title="$t('common.delete')"
            :cancel-title="$t('common.cancel')"
            ok-variant="danger"
            >{{ $t('caseDetail.deleteCaseVideoConfirmMsg') }}</b-modal
        >

        <!-- Remove video confirmation -->
        <b-modal
            ref="deleteVideoModal"
            :title="$t('common.confirmation')"
            no-close-on-esc
            no-close-on-backdrop
            @ok="handleDeleteVideoOk"
            :ok-title="$t('common.delete')"
            :cancel-title="$t('common.cancel')"
            ok-variant="danger"
            >{{ $t('caseDetail.deleteVideoConfirmMsg') }}</b-modal
        >

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
            >{{ $t('cases.deleteConfirmMsg', { caseName: caseItem.name }) }}</b-modal
        >

        <AddVideoToCaseModal :caseItemId="caseId" @addVideoToCaseSuccess="fetchCaseVideoList" />
    </div>
</template>

<script>
import { mapActions, mapState } from 'vuex';
import CONSTANTS from '@/constants';
import CaseVideoThumbnail from '@/components/CaseVideoThumbnail';
import AddVideoToCaseModal from '@/components/AddVideoToCase/AddVideoToCaseModal';
import { setInterval, clearInterval } from 'timers';

export default {
    name: 'case-status',
    components: {
        CaseVideoThumbnail,
        AddVideoToCaseModal
    },
    mounted() {
        this.$nextTick(function() {
            if (this.caseId) {
                this.resetAnalyzeCaseData();
                this.getaAnalyzeCaseDetail({
                    id: this.caseId
                });

                this.resetCaseVideoData();
                this.fetchCaseVideoList();
            }
        });
    },
    data() {
        return {
            CONSTANTS,
            caseId: this.$route.params.id,
            selectedItemId: null,
            caseVideosReloadInterval: null
        };
    },
    computed: {
        ...mapState({
            items: state => state.caseVideo.items,
            caseItem: state => state.analyzeCase.item
        })
    },
    methods: {
        ...mapActions({
            resetCaseVideoData: 'caseVideo/resetData',
            getCaseVideoListFull: 'caseVideo/getListFull',
            deleteCaseVideo: 'caseVideo/delete',
            updateCaseVideoState: 'caseVideo/updateState',
            deleteVideo: 'video/delete',
            resetAnalyzeCaseData: 'analyzeCase/resetData',
            getaAnalyzeCaseDetail: 'analyzeCase/getDetail',
            deleteAnalyzeCase: 'analyzeCase/delete'
        }),
        fetchCaseVideoList() {
            this.getCaseVideoListFull({
                caseId: this.caseId
            });

            if (this.caseVideosReloadInterval) {
                clearInterval(this.caseVideosReloadInterval);
            }
            this.caseVideosReloadInterval = setInterval(() => {
                this.getCaseVideoListFull({
                    caseId: this.caseId
                });
            }, CONSTANTS.CASE_LIST_RELOAD_INTERVAL);
        },

        // Delete case video modal
        openDeleteCaseVideoModal(id) {
            if (!id) return;
            this.selectedItemId = id;
            this.$refs.deleteCaseVideoModal.show();
        },
        handleDeleteCaseVideoOk(modal) {
            // Prevent modal from closing
            modal.preventDefault();
            // Trigger submit handler
            this.deleteCaseVideo({
                id: this.selectedItemId
            }).then(() => {
                const removeIndex = this.items.findIndex(item => item.id === this.selectedItemId);
                const newItems = _.cloneDeep(this.items);
                newItems.splice(removeIndex, 1);
                this.updateCaseVideoState({
                    stateName: 'items',
                    value: newItems
                });
                this.$refs.deleteCaseVideoModal.hide();
                this.$toaster.success(this.$t('caseDetail.deleteCaseVideoSuccessMsg'));
            });
        },

        // Delete video modal
        openDeleteVideoModal(id) {
            if (!id) return;
            this.selectedItemId = id;
            this.$refs.deleteVideoModal.show();
        },
        handleDeleteVideoOk(modal) {
            // Prevent modal from closing
            modal.preventDefault();
            // Trigger submit handler
            const caseVideoItem = this.items.find(item => item.id === this.selectedItemId);
            this.deleteVideo({
                id: caseVideoItem.video.id
            }).then(() => {
                const removeIndex = this.items.findIndex(item => item.id === this.selectedItemId);
                const newItems = _.cloneDeep(this.items);
                newItems.splice(removeIndex, 1);
                this.updateCaseVideoState({
                    stateName: 'items',
                    value: newItems
                });
                this.$refs.deleteVideoModal.hide();
                this.$toaster.success(this.$t('caseDetail.deleteVideoSuccessMsg'));
            });
        },
        getStatusClass(statusId) {
            switch (statusId) {
                case -1:
                    return 'secondary';
                case 0:
                case 1:
                    return 'warning';
                case 2:
                    return 'success';
                case 3:
                    return 'error';
            }
        },
        getStatusText(statusId) {
            const status = CONSTANTS.VIDEO_STATUS_TEXTES.find(item => item.id === statusId);
            if (status) {
                return this.$t(`videoStatuses.${status.text}`);
            } else {
                return '';
            }
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
    },
    beforeDestroy() {
        if (this.caseVideosReloadInterval) {
            clearInterval(this.caseVideosReloadInterval);
        }
    }
};
</script>

<style lang="scss" scoped></style>
