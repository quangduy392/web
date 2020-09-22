<template>
    <div
        class="case-video-thumbnail ratio-16-9 text-center position-relative"
        :class="{
            rounded: rounded,
            'case-video-thumbnail_processing': isVideoProcessing
        }"
        :style="{
            'background-image': `url(${getCaseVideoThumbnail(video, size)})`
        }"
        @click="clickEvent"
        @mouseover="mouseOverEvent"
        @mouseleave="mouseLeaveEvent"
    >
        <div class="obsolute-full d-flex justify-content-center align-items-center flex-column">
            <i class="fa fa-file-image-o text-gray-300" aria-hidden="true" v-if="isVideoError"></i>
            <i
                class="fa fa fa-play-circle cursor-pointer text-gray-200"
                :class="{
                    'fa-2x': size == CONSTANTS.VIDEO_SNAPSHOT_SIZE.SMALL,
                    'fa-4x': size == CONSTANTS.VIDEO_SNAPSHOT_SIZE.MEDIUM
                }"
                aria-hidden="true"
                v-if="!isVideoProcessing && !isVideoError && showPlayButton"
                @click="playVideoEvent"
            ></i>
            <span class="small case-video-thumbnail_video_time" v-if="showVideoTime">
                {{ video.time | formatDateTime }}
            </span>
        </div>
    </div>
</template>

<script>
import getVideoSnapshotUrl from '@/utils/getVideoSnapshotUrl';
import CONSTANTS from '@/constants';

export default {
    name: 'case-video-thumbnail',
    props: {
        video: {
            type: Object,
            default: {}
        },
        size: {
            type: String,
            default: CONSTANTS.VIDEO_SNAPSHOT_SIZE.MEDIUM
        },
        rounded: {
            type: Boolean,
            default: false
        },
        fixWidth: {
            type: Boolean,
            default: false
        },
        videoPlaceholder: {
            type: Boolean,
            default: false
        },
        vmsVideo: {
            type: Boolean,
            default: false
        },
        showPlayButton: {
            type: Boolean,
            default: false
        },
        showVideoTime: {
            type: Boolean,
            default: false
        }
    },
    data() {
        return {
            CONSTANTS,
            isVideoProcessing:
                !this.videoPlaceholder &&
                !this.vmsVideo &&
                this.video.status < CONSTANTS.VIDEO_STATUS.DONE,
            isVideoError:
                this.videoPlaceholder || this.video.status === CONSTANTS.VIDEO_STATUS.ERROR
        };
    },
    methods: {
        getCaseVideoThumbnail(video, size) {
            if (this.videoPlaceholder) {
                return '';
            } else if (this.isVideoProcessing) {
                return CONSTANTS.LOADING_ICON;
            } else if (!this.vmsVideo && video.id) {
                return getVideoSnapshotUrl(video.id, size);
            } else if (this.vmsVideo && video.imageViewUrl) {
                return video.imageViewUrl;
            } else {
                return '';
            }
        },
        clickEvent() {
            this.$emit('click');
        },
        mouseOverEvent() {
            this.$emit('mouseover');
        },
        mouseLeaveEvent() {
            this.$emit('mouseleave');
        },
        playVideoEvent() {
            this.$emit('playVideo');
        }
    }
};
</script>

<style lang="scss" scoped>
</style>
