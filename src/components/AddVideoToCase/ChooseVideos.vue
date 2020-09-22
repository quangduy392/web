<template>
    <div class="h-100 d-flex flex-column">
        <div class="text-success px-3 py-2">
            <b-row>
                <b-col cols="8">
                    {{ $t('cases.selectedVideoCount', { count: selectedVideos.length }) }}
                </b-col>
                <b-col cols="4">
                    <RDateTimePicker v-model="videoDate" @input="filterVideoByDate" />
                </b-col>
            </b-row>
        </div>

        <div class="flex-1 overflow-hidden" v-if="!isShowLoading">
            <div class="h-100 overflow-y-auto overflow-x-hidden px-3 pb-3" v-if="pagedItems.length">
                <b-row>
                    <b-col cols="2" v-for="video in pagedItems" :key="video.id" class="mb-3">
                        <div
                            class="add-video_video-item cursor-pointer rounded mb-2"
                            :class="{
                                'add-video_video-item_active': isSelectedVideo(video.id)
                            }"
                            @click="toggleSelectVideo(video)"
                        >
                            <case-video-thumbnail
                                class="border"
                                :class="{
                                    'border-success': isSelectedVideo(video.id),
                                    'border-gray-500': !isSelectedVideo(video.id)
                                }"
                                rounded
                                :video="video"
                                :size="CONSTANTS.VIDEO_SNAPSHOT_SIZE.MEDIUM"
                                showVideoTime
                            />
                            <i
                                class="fa fa-3x fa-check text-success add-video_video-item_active-icon"
                                aria-hidden="true"
                            ></i>
                        </div>
                        <div v-line-clamp="1">
                            {{ video.name }}
                        </div>
                    </b-col>
                </b-row>
            </div>

            <div
                class="h-100 d-flex justify-content-center align-items-center"
                v-if="!videos.length"
            >
                {{ $t('cases.noVideo') }}
            </div>
        </div>

        <div
            v-if="isShowLoading"
            class="flex-1 d-flex flex-column justify-content-center align-items-center"
        >
            <img src="/static/img/loader-green.gif" class="standalone-loading" />
        </div>

        <r-pagination
            v-model="currentPage"
            :items="filteredItems"
            :per="CONSTANTS.VIDEO_LIST_PER"
            @pageChanged="updatePagedItem"
            v-if="videos.length"
            v-show="pagedItems.length"
        ></r-pagination>
    </div>
</template>

<script>
import { mapActions, mapState } from 'vuex';
import CONSTANTS from '../../constants';
import CaseVideoThumbnail from '@/components/CaseVideoThumbnail';
import RDateTimePicker from '@/components/RDateTimePicker';
import moment from 'moment-timezone';

export default {
    name: 'choose-videos',
    components: {
        CaseVideoThumbnail,
        RDateTimePicker
    },
    mounted: function() {
        this.$nextTick(async function() {
            this.resetVideoData();
            this.isShowLoading = true;
            await this.getVideoList();
            this.filterVideoByDate();
            this.isShowLoading = false;
        });
    },
    computed: {
        ...mapState({
            videos: state =>
                state.video.items.filter(video => video.status === CONSTANTS.VIDEO_STATUS.DONE)
        })
    },
    data() {
        return {
            CONSTANTS,
            selectedVideos: [],
            isShowLoading: false,
            currentPage: 1,
            pagedItems: [],
            videoDate: null,
            filteredItems: []
        };
    },
    methods: {
        ...mapActions({
            resetVideoData: 'video/resetData',
            getVideoList: 'video/getList'
        }),
        isSelectedVideo(videoId) {
            return this.selectedVideos.find(video => video.id === videoId);
        },
        toggleSelectVideo(video) {
            if (this.isSelectedVideo(video.id)) {
                const removedIndex = this.selectedVideos.findIndex(v => v.id === video.id);
                this.selectedVideos.splice(removedIndex, 1);
            } else {
                this.selectedVideos.push(video);
            }

            this.$emit('updateSelectedVideos', this.selectedVideos);
        },
        updatePagedItem(pagedItems) {
            this.isShowLoading = true;
            setTimeout(() => {
                this.pagedItems = pagedItems;
                this.isShowLoading = false;
            }, 300);
        },
        filterVideoByDate() {
            if (!this.videoDate) {
                this.filteredItems = this.videos;
            } else {
                this.filteredItems = this.videos.filter(
                    video =>
                        moment(video.time).format('DD/MM/YYY') ===
                        moment(this.videoDate).format('DD/MM/YYY')
                );
            }
        }
    }
};
</script>

<style lang="scss" scoped>
</style>
