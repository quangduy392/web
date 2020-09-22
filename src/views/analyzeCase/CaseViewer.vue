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

        <div class="page-content sub-header-page-content">
            <div class="d-flex h-100">
                <div class="case-detail_sidebar p-2 h-100 overflow-y-scroll">
                    <case-detail-video-item
                        v-for="(item, index) in caseVideos"
                        :key="`${item.id}-${item.video.status}`"
                        :video="item.video"
                        :server="item.server"
                        showObjectCount
                        :objectCount="objectsByVideo[index] ? objectsByVideo[index].length : 0"
                        :displayedObjectCount="getDisplayedObjectCountByVideo(item.video.id)"
                        class="pb-2 mb-2 border-bottom border-gray-500"
                        @updateCaseVideoItem="updateCaseVideoItem"
                    ></case-detail-video-item>
                </div>
                <div class="py-2 pl-2 pr-0 h-100 overflow-hidden flex-1 d-flex flex-column">
                    <div
                        class="d-flex justify-content-between align-content-center mb-2 px-2"
                        style="z-index: 1;"
                    >
                        <div class="text-success">
                            {{ $t('caseDetail.videoItem.objectCount') }}:
                            <span v-if="fiteredVideoObjects.length === videoObjects.length">{{
                                videoObjects.length
                            }}</span>

                            <span v-if="fiteredVideoObjects.length < videoObjects.length"
                                >{{ fiteredVideoObjects.length }}/{{ videoObjects.length }}</span
                            >
                            <span v-if="minObjectTime && maxObjectTime" class="text-gray-300">
                                ({{ minObjectTime | formatDateTime }} -
                                {{ maxObjectTime | formatDateTime }})
                            </span>
                        </div>
                        <div>
                            <span class="text-muted mr-2 text-gray-300"
                                >{{ $t('common.sortBy') }}:</span
                            >
                            <a
                                href="javascript:void(0)"
                                class="text-decoration-none"
                                :class="{
                                    'text-white': sortBy == 'oldest',
                                    'text-gray-300 ': sortBy != 'oldest'
                                }"
                                @click="doSort('oldest')"
                                >{{ $t('common.oldestSort') }}</a
                            >
                            <span class="text-white mx-2">|</span>
                            <a
                                href="javascript:void(0)"
                                class="text-decoration-none"
                                :class="{
                                    'text-white': sortBy == 'newest',
                                    'text-gray-300 ': sortBy != 'newest'
                                }"
                                @click="doSort('newest')"
                                >{{ $t('common.newestSort') }}</a
                            >
                        </div>

                        <!-- <b-form-checkbox id="select-all-checkbox" v-model="selectAll">
                            Select all
                        </b-form-checkbox>-->
                    </div>

                    <div
                        class="masonry-with-columns flex-1 overflow-y-scroll"
                        v-if="pagedVideoObjects.length"
                    >
                        <case-object
                            v-for="object in pagedVideoObjects"
                            :object="object"
                            class="marsony-item"
                            @findSimilarObject="findSimilarObject"
                            :key="`${object.video.id}-${object.id}`"
                            showFindSimilarObjectBtn
                        ></case-object>
                    </div>

                    <div
                        v-if="!isShowLoading && !pagedVideoObjects.length"
                        class="d-flex flex-1 justify-content-center align-items-center text-muted"
                    >
                        {{ $t('caseDetail.noObject') }}
                    </div>

                    <r-pagination
                        v-model="currentPage"
                        :items="fiteredVideoObjects"
                        :per="CONSTANTS.VIDEO_OBJECT_PER"
                        @pageChanged="updatePagedItem"
                        v-if="videoObjects.length"
                        v-show="fiteredVideoObjects.length && !isShowLoading"
                    ></r-pagination>

                    <div
                        v-if="isShowLoading"
                        class="h-100 d-flex flex-column justify-content-center align-items-center"
                    >
                        <img src="/static/img/loader-green.gif" class="standalone-loading" />
                    </div>
                </div>
                <div class="case-detail_sidebar h-100">
                    <objects-filter-sidebar
                        v-model="filterCondition"
                        :caseId="caseId"
                        :items="videoObjects"
                        :filterClasses="filterClasses"
                        :filterColors="filterColors"
                        :minObjectTime="minObjectTime"
                        :maxObjectTime="maxObjectTime"
                        @doFilter="doFilter"
                    />
                </div>
            </div>
        </div>

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
import CaseDetailVideoItem from '@/components/CaseDetailVideoItem';
import ObjectsFilterSidebar from '@/components/ObjectsFilterSidebar';
import CaseObject from '@/components/CaseObject';
import _ from 'lodash';
import getObjectTime from '@/utils/getObjectTime';
import AddVideoToCaseModal from '@/components/AddVideoToCase/AddVideoToCaseModal';
import { setInterval, clearInterval } from 'timers';

export default {
    name: 'case-status',
    components: {
        CaseDetailVideoItem,
        CaseObject,
        ObjectsFilterSidebar,
        AddVideoToCaseModal
    },
    mounted() {
        this.$nextTick(async function() {
            if (this.caseId) {
                this.isShowLoading = true;

                // Case detail
                this.resetAnalyzeCaseData();
                this.getaAnalyzeCaseDetail({
                    id: this.caseId
                });

                // Case videos and object
                this.resetCaseVideoData();
                this.fetchCaseVideoList();

                // Bookmarks
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
            sortBy: 'oldest',
            selectAll: false,
            objectsByVideo: [],
            videoObjects: [],
            filterCondition: {},
            fiteredVideoObjects: [],
            isShowLoading: true,
            currentPage: 1,
            pagedVideoObjects: [],
            filterClasses: [],
            filterColors: [],
            caseVideos: [],
            minObjectTime: null,
            maxObjectTime: null,
            processedCaseVideoIds: [],
            serverIds: [],
            serverInfoList: [],
            fetchCaseVideoDataInterval: null
        };
    },
    computed: {
        ...mapState({
            caseItem: state => state.analyzeCase.item
        })
    },
    methods: {
        ...mapActions({
            resetCaseVideoData: 'caseVideo/resetData',
            getCaseVideoListFull: 'caseVideo/getListFull',
            getVideoObjectList: 'videoObject/getList',
            getServerDetail: 'server/getDetail',
            resetAnalyzeCaseData: 'analyzeCase/resetData',
            getaAnalyzeCaseDetail: 'analyzeCase/getDetail',
            resetBookmarkData: 'bookmark/resetData',
            getBookmarkList: 'bookmark/getList',
            deleteAnalyzeCase: 'analyzeCase/delete',
            updateVideoState: 'video/updateState'
        }),
        doSort(sortBy = 'newest', objects) {
            const videoObjects = objects || this.videoObjects;
            this.sortBy = sortBy;

            this.videoObjects = videoObjects.sort((object1, object2) => {
                const object1Time = getObjectTime(object1);
                const object2Time = getObjectTime(object2);
                if (object1Time.isAfter(object2Time)) {
                    return sortBy === 'newest' ? -1 : 1;
                }
                if (object2Time.isAfter(object1Time)) {
                    return sortBy === 'newest' ? 1 : -1;
                }
                return 0;
            });

            if (this.videoObjects.length) {
                const minTimeObjetIndex = sortBy === 'newest' ? this.videoObjects.length - 1 : 0;
                const maxTimeObjetIndex = sortBy === 'newest' ? 0 : this.videoObjects.length - 1;
                this.minObjectTime = getObjectTime(this.videoObjects[minTimeObjetIndex])
                    .seconds(0)
                    .millisecond(0);
                this.maxObjectTime = getObjectTime(this.videoObjects[maxTimeObjetIndex])
                    .seconds(59)
                    .millisecond(999);
            } else {
                this.minObjectTime = null;
                this.maxObjectTime = null;
            }
            console.log(JSON.stringify(this.videoObjects));
        },
        doFilter(value) {
            this.fiteredVideoObjects = value;
        },

        updatePagedItem(pagedItems) {
            this.isShowLoading = true;
            setTimeout(() => {
                this.pagedVideoObjects = pagedItems;
                this.isShowLoading = false;
            }, 300);
        },
        getDisplayedObjectCountByVideo(videoId) {
            return this.fiteredVideoObjects.filter(object => object.video.id === videoId).length;
        },
        // Find similar object
        findSimilarObject(filterCondition) {
            this.filterCondition = filterCondition || {};
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
        },
        async fetchCaseVideoList() {
            let notFinishedHandlingVideos = await this.fetchCaseVideoListIntervalFunc();

            if (notFinishedHandlingVideos.length > 0 && !this.fetchCaseVideoDataInterval) {
                this.fetchCaseVideoDataInterval = setInterval(async () => {
                    notFinishedHandlingVideos = await this.fetchCaseVideoListIntervalFunc();

                    if (notFinishedHandlingVideos.length === 0) {
                        clearInterval(this.fetchCaseVideoDataInterval);
                    }
                }, CONSTANTS.CASE_LIST_RELOAD_INTERVAL);
            }
        },
        async fetchCaseVideoListIntervalFunc() {
            const caseVideos = await this.getCaseVideoListFull({
                caseId: this.caseId
            });
            await this.fetchCaseVideoData(caseVideos);

            // Not finished handling video
            const notFinishedHandlingVideos = caseVideos.filter(
                caseVideo =>
                    caseVideo.video.status < CONSTANTS.VIDEO_STATUS.DONE &&
                    this.processedCaseVideoIds.indexOf(caseVideo.id) === -1 // Video status done and have not been processed
            );
            return notFinishedHandlingVideos;
        },
        async fetchCaseVideoData(caseVideos) {
            // Get server info
            const newServerIds = [];
            caseVideos.forEach(caseVideo => {
                const serverId = caseVideo.video.serverId;
                if (
                    serverId &&
                    this.serverIds.indexOf(serverId) === -1 &&
                    newServerIds.indexOf(serverId) === -1
                ) {
                    newServerIds.push(serverId);
                }
            });

            if (newServerIds.length) {
                this.serverIds = [...this.serverIds, ...newServerIds];
                const newServerInfoList = await Promise.all(
                    newServerIds.map(serverId =>
                        this.getServerDetail({
                            endpointSubfix: serverId
                        }).catch(err => {
                            console.log(err);
                            return null;
                        })
                    )
                );
                this.serverInfoList = [...this.serverInfoList, ...newServerInfoList];
            }

            // Process case videos which have not been processed yet
            const newCaseVideos = caseVideos.filter(
                caseVideo =>
                    caseVideo.video.status === CONSTANTS.VIDEO_STATUS.DONE &&
                    this.processedCaseVideoIds.indexOf(caseVideo.id) === -1 // Video status done and have not been processed
            );

            if (newCaseVideos.length) {
                const newObjectByVideo = await Promise.all(
                    newCaseVideos.map(caseVideo => {
                        this.processedCaseVideoIds.push(caseVideo.id);

                        return this.getVideoObjectList({
                            endpointSubfix: caseVideo.videoId
                        });
                    })
                );
                this.objectsByVideo = [...this.objectsByVideo, ...newObjectByVideo];

                // Format data
                const objects = _.cloneDeep(this.videoObjects);
                const filterClasses = _.cloneDeep(this.filterClasses);
                const filterColors = _.cloneDeep(this.filterColors);
                for (const index in newCaseVideos) {
                    const { video } = newCaseVideos[index];
                    const server = this.serverInfoList.find(server => server.id === video.serverId);

                    // API can return null: LOL
                    if (newObjectByVideo[index]) {
                        objects.push(
                            ...newObjectByVideo[index].map(object => {
                                // Get classes and colors to filter
                                if (object.class) {
                                    filterClasses.push(object.class);
                                }
                                if (object.colors && object.colors.length > 0) {
                                    filterColors.push(...object.colors);
                                }

                                // re-format object data
                                return { ...object, video, server, caseId: this.caseId };
                            })
                        );
                    }
                }
                this.filterClasses = _.uniq(filterClasses);
                this.filterColors = _.uniq(filterColors);
                this.doSort('oldest', objects);
            }

            // Format data
            for (const index in caseVideos) {
                const caseVideo = caseVideos[index];
                const { video, server } = caseVideo;
                if (!server && video.serverId) {
                    const server = this.serverInfoList.find(server => server.id === video.serverId);

                    // add server info into each case video
                    caseVideos[index].server = server;
                }
            }

            // Fill data to state
            this.caseVideos = [...caseVideos];
        },
        updateCaseVideoItem() {
            // Case videos and object
            this.resetCaseVideoData();
            this.fetchCaseVideoList();
        }
    },
    beforeDestroy() {
        if (this.fetchCaseVideoDataInterval) {
            clearInterval(this.fetchCaseVideoDataInterval);
        }
    }
};
</script>

<style lang="scss" scoped></style>
