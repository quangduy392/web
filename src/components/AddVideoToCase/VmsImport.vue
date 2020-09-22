<template>
    <div class="h-100 d-flex flex-column">
        <div class="px-3 pt-3">
            <b-row>
                <b-col cols="4">
                    <b-form-group :label="$t('cases.vmsImportSelectVms')">
                        <b-form-select
                            v-model="vmsVideoSearchConditions.vmsId"
                            :options="[
                                { id: null, name: $t('cases.vmsImportSelectVms'), disabled: true },
                                ...vmses
                            ]"
                            value-field="id"
                            text-field="name"
                            @change="vmsSelectChange"
                        ></b-form-select>
                    </b-form-group>
                </b-col>

                <b-col cols="4" v-show="vmsVideoSearchConditions.vmsId">
                    <b-form-group :label="$t('cases.vmsImportSelectVmsMonitor')">
                        <b-form-select
                            v-model="vmsVideoSearchConditions.vmsCameraId"
                            :options="[
                                {
                                    vmsCameraId: null,
                                    name: $t('cases.vmsImportSelectVmsMonitor'),
                                    disabled: true
                                },
                                ...vmsMonitors
                            ]"
                            value-field="vmsCameraId"
                            text-field="name"
                            :disabled="!vmsMonitors.length"
                            @change="vmsMonitorSelectChange"
                        ></b-form-select>
                    </b-form-group>
                </b-col>

                <b-col
                    cols="4"
                    v-show="vmsVideoSearchConditions.vmsId && vmsVideoSearchConditions.vmsCameraId"
                >
                    <b-form-group :label="$t('cases.dateSelect')">
                        <RDateTimePicker
                            v-model="vmsVideoSearchConditions.videoDate"
                            @input="filterVideoByDate"
                        />
                    </b-form-group>
                </b-col>
            </b-row>
        </div>

        <div
            class="flex-1 overflow-hidden"
            v-if="
                !isShowLoading &&
                    vmsVideoSearchConditions.vmsId &&
                    vmsVideoSearchConditions.vmsCameraId &&
                    vmsVideoSearchConditions.videoDate
            "
        >
            <div class="text-success px-3 py-2" v-if="pagedItems.length">
                <i class="fa fa-check" aria-hidden="true"></i>
                {{ $t('cases.selectedVideoCount', { count: selectedVmsVideos.length }) }}
            </div>

            <div class="h-100 overflow-y-auto overflow-x-hidden px-3 pb-3" v-if="pagedItems.length">
                <b-row>
                    <b-col cols="2" v-for="vmsVideo in pagedItems" :key="vmsVideo.id" class="mb-4">
                        <div
                            class="add-video_video-item cursor-pointer border rounded mb-2"
                            :class="{
                                'add-video_video-item_active border-success': isSelectedVideo(
                                    vmsVideo.id
                                )
                            }"
                            @click="toggleSelectVideo(vmsVideo)"
                        >
                            <case-video-thumbnail
                                rounded
                                vmsVideo
                                :video="vmsVideo"
                                :size="CONSTANTS.VIDEO_SNAPSHOT_SIZE.MEDIUM"
                                showVideoTime
                            />

                            <i
                                v-if="isSelectedVideo(vmsVideo.id)"
                                class="fa fa-3x fa-check text-success add-video_video-item_active-icon"
                                aria-hidden="true"
                            ></i>
                        </div>
                        {{ vmsVideo.fileName }}
                    </b-col>
                </b-row>
            </div>

            <div
                class="h-100 d-flex justify-content-center align-items-center"
                v-if="!filteredItems.length"
            >
                {{ $t('cases.noVideo') }}
            </div>
        </div>

        <div
            v-if="isShowLoading"
            class="h-100 d-flex flex-column justify-content-center align-items-center"
        >
            <img src="/static/img/loader-green.gif" class="standalone-loading" />
        </div>

        <r-pagination
            v-model="currentPage"
            :items="filteredItems"
            :per="CONSTANTS.VIDEO_LIST_PER"
            @pageChanged="updatePagedItem"
            v-show="filteredItems.length"
        ></r-pagination>
    </div>
</template>

<script>
import { mapActions, mapState } from 'vuex';
import CONSTANTS from '../../constants';
import getVmsBaseUrl from '../../utils/getVmsBaseUrl';
import getVmsImageViewUrl from '../../utils/getVmsImageViewUrl';
import { setTimeout } from 'timers';
import CaseVideoThumbnail from '@/components/CaseVideoThumbnail';
import RDateTimePicker from '@/components/RDateTimePicker';
import moment from 'moment-timezone';

export default {
    name: 'vms-import',
    components: {
        CaseVideoThumbnail,
        RDateTimePicker
    },
    mounted: function() {
        this.$nextTick(function() {
            this.resetVideoData();
            this.resetVmsData();
            this.resetVmsMonitorData();
            this.resetVmsVideoData();

            this.getVmsList();
        });
    },
    computed: {
        ...mapState({
            videos: state => state.video.items,
            vmses: state => state.vms.items,
            vmsMonitors: state => state.vmsMonitor.items,
            vmsVideos: state => state.vmsVideo.items
        })
    },
    watch: {
        vmsVideos(value) {
            this.vmsVideoList = value.map(item => ({
                ...item,
                imageViewUrl: getVmsImageViewUrl(
                    item.imageViewUrl,
                    getVmsBaseUrl(this.selectedVms.ip, this.selectedVms.port)
                ),
                time: moment.utc(item.startTime).toISOString()
            }));
        }
    },
    data() {
        return {
            CONSTANTS,

            selectedVms: null,
            selectedVmsMonitor: null,
            selectedVmsVideoIdsTemp: [],
            selectedVmsVideos: [],

            vmsVideoSearchConditions: {
                vmsId: null,
                vmsCameraId: null,
                videoDate: null
            },

            isShowLoading: false,
            vmsVideoList: [],
            currentPage: 1,
            pagedItems: [],
            filteredItems: []
        };
    },
    methods: {
        ...mapActions({
            resetVideoData: 'video/resetData',
            resetVmsData: 'vms/resetData',
            resetVmsMonitorData: 'vmsMonitor/resetData',
            resetVmsVideoData: 'vmsVideo/resetData',
            getVmsList: 'vms/getList',
            getVmsMonitorList: 'vmsMonitor/getList',
            getVmsVideoList: 'vmsVideo/getList'
        }),
        getVmsBaseUrl,
        getVmsImageViewUrl,
        getAvailabledVideo(videoList) {
            return videoList.filter(video => video.status === CONSTANTS.VIDEO_STATUS.DONE);
        },
        vmsSelectChange() {
            // Reset data
            this.vmsVideoSearchConditions = {
                ...this.vmsVideoSearchConditions,
                vmsCameraId: null,
                videoDate: null
            };
            this.resetVmsMonitorData();
            this.resetVmsVideoData();
            this.selectedVmsMonitor = [];
            this.selectedVmsVideos = [];
            this.$emit('updateSelectedVideos', []);

            this.selectedVms = this.vmses.find(e => e.id === this.vmsVideoSearchConditions.vmsId);

            // Fetch data
            this.getVmsMonitorList({
                vmsBaseUrl: getVmsBaseUrl(this.selectedVms.ip, this.selectedVms.port),
                mode: 'special',
                user: this.selectedVms.username,
                pass: this.selectedVms.password
            });
        },
        async vmsMonitorSelectChange() {
            // Reset data
            this.resetVmsVideoData();
            this.selectedVmsVideos = [];
            this.$emit('updateSelectedVideos', []);

            this.selectedVmsMonitor = this.vmsMonitors.find(
                e => e.vmsCameraId === this.vmsVideoSearchConditions.vmsCameraId
            );

            // Fetch data
            this.currentPage = 1;
            await this.getVmsVideoList({
                vmsBaseUrl: getVmsBaseUrl(this.selectedVms.ip, this.selectedVms.port),
                mode: 'special',
                user: this.selectedVms.username,
                pass: this.selectedVms.password,
                vmsCameraId: this.selectedVmsMonitor.vmsCameraId
            });

            if (this.vmsVideoSearchConditions.videoDate) {
                this.filterVideoByDate();
            }
        },
        isSelectedVideo(vmsVideoId) {
            return this.selectedVmsVideos.find(v => v.id === vmsVideoId);
        },
        toggleSelectVideo: async function(vmsVideo) {
            if (this.isSelectedVideo(vmsVideo.id)) {
                const removedIndex = this.selectedVmsVideos.findIndex(v => v.id === vmsVideo.id);
                this.selectedVmsVideos.splice(removedIndex, 1);
            } else {
                this.selectedVmsVideos.push(vmsVideo);
            }
            this.$emit(
                'updateSelectedVideos',
                this.selectedVmsVideos.map(v => ({
                    vmsId: this.selectedVms.id,
                    vmsCameraId: this.selectedVmsMonitor.vmsCameraId,
                    name: v.fileName,
                    filename: v.fileName,
                    url: v.videoDownloadUrl,
                    time: v.startTime,
                    status: CONSTANTS.VIDEO_STATUS.VMS_DOWNLOAD,
                    progress: 0,

                    // Display only
                    imageViewUrl: v.imageViewUrl
                }))
            );
        },
        updatePagedItem(pagedItems) {
            this.isShowLoading = true;
            setTimeout(() => {
                this.pagedItems = pagedItems;
                this.isShowLoading = false;
            }, 300);
        },
        filterVideoByDate() {
            this.filteredItems = this.vmsVideoList.filter(
                video =>
                    moment(video.time).format('DD/MM/YYY') ===
                    moment(this.vmsVideoSearchConditions.videoDate).format('DD/MM/YYY')
            );
        }
    }
};
</script>

<style lang="scss" scoped>
</style>
