<template>
    <div
        class="case-object mx-1 mb-2 border border-gray-900"
        :style="{
            'background-image': `url(${getVideoObjectImageUrl(object)})`
        }"
        @mouseover="isHovering = true"
        @mouseleave="isHovering = false"
    >
        <i
            class="delete-btn fa font-17 cursor-pointer font-weight-bold"
            :class="{'fa-star text-warning': isBookmarked(), 'fa-star-o text-gray-200': !isBookmarked()}"
            aria-hidden="true"
            @click="toggleAddToReport()"
            v-if="isHovering || isBookmarked()"
            v-b-tooltip.hover
            :title="$t(`caseDetail.bookmark.${isBookmarked() ? 'deleteBookmark' : 'addBookmark'}`)"
        ></i>

        <i
            class="play-btn fa fa fa-3x fa-play-circle text-gray-200 cursor-pointer"
            aria-hidden="true"
            v-if="isHovering"
            @click="showObjectDetailModal()"
        ></i>

        <div class="object-time text-center small">
            {{ getObjectTime(object) | formatDateTime }}
        </div>

        <!-- Image to keep div width -->
        <b-img :src="getVideoObjectImageUrl(object)" class="h-100 invisible"></b-img>

        <!-- Object detail modal -->
        <b-modal ref="objectDetailModal" :title="$t('caseDetail.objectItem.objectDetail')" hide-footer size="xl" centered>
            <b-row>
                <b-col cols="2">
                    <h4 v-line-clamp="1">{{this.object.video.name}}</h4>

                    <p>
                        <div class="text-white">{{ $t('caseDetail.objectItem.eventTime') }}:</div>
                        <div class="text-gray-300">{{ getObjectTime(this.object) | formatDateTime}}</div>
                    </p>

                    <p>
                        <div class="text-white">{{ $t('caseDetail.objectItem.fileName') }}:</div>
                        <div class="text-gray-300">{{this.object.video.filename}}</div>
                    </p>
                </b-col>
                <b-col cols="8">
                    <div class="video-player-container border border-gray-500 ratio-16-9 position-relative bg-gray-900"
                        
                    >
                        <div
                            class="obsolute-full d-flex flex-column justify-content-center align-items-center"
                            v-if="isShowLoading"
                        >
                            <img src="/static/img/loader-green.gif" class="standalone-loading" />
                        </div>

                        <video controls autoplay width="100%" height="auto" muted
                            ref="videoPlayerRef"
                            v-if="!isShowLoading"
                            class="obsolute-full"
                        >
                            <source
                                :src="objectFocusVideoUrl"
                                type="video/mp4"
                            />
                        </video>
                    </div>
                </b-col>
                <b-col cols="2">
                    <div class="text-gray-300 py-2 mb-2">
                        <a href="javascript:void(0)" @click="changeObjectVideoType"
                            :class="{'disabled cursor-not-allowed': !objectFocusVideoUrl || !objectOriginVideoUrl}"
                        >
                            <i class="fa fa-video-camera mr-2" aria-hidden="true"></i> {{ $t(`caseDetail.objectItem.${isShowObjectFocusVideo ? 'originalVideo' : 'focusVideo'}`) }}
                        </a>
                    </div>
                    <div class="text-gray-300 py-2 mb-2">
                        <a href="javascript:void(0)" @click="toggleAddToReport"
                            :class="{'disabled cursor-not-allowed': !objectFocusVideoUrl || !objectOriginVideoUrl}"
                        >
                            <i class="fa mr-2" aria-hidden="true"
                                :class="{'fa-star': isBookmarked(), 'fa-star-o': !isBookmarked()}"
                            ></i> {{ $t(`caseDetail.objectItem.${isBookmarked() ? 'removeFromReport' : 'addToReport'}`) }}
                        </a>
                    </div>
                    <div class="text-gray-300 py-2 mb-2" v-if="showFindSimilarObjectBtn">
                        <a href="javascript:void(0)" @click="findSimilarObject">
                            <i class="fa fa-clone mr-2" aria-hidden="true"></i> {{ $t('caseDetail.objectItem.appearanceSimilarity') }}
                        </a>
                    </div>
                </b-col>
            </b-row>
        </b-modal>

        <!-- Delete confirmation -->
        <b-modal
            ref="deleteBookmarkModal"
            :title="$t('common.confirmation')"
            no-close-on-esc
            no-close-on-backdrop
            @ok="handleDeleteBookmarkOk"
            :ok-title="$t('common.delete')"
            :cancel-title="$t('common.cancel')"
            ok-variant="danger"
        >
            {{ $t('caseDetail.bookmark.deleteMsg') }}
        </b-modal>
    </div>
</template>

<script>
import { mapState, mapActions } from 'vuex';
import getVideoObjectImageUrl from '@/utils/getVideoObjectImageUrl';
import getObjectTime from '@/utils/getObjectTime';
import CONSTANTS from '../constants';

export default {
    name: 'case-object',
    props: {
        object: {
            type: Object,
            default: {}
        },
        showFindSimilarObjectBtn: {
            type: Boolean,
            default: false
        }
    },
    computed: {
        ...mapState({
            bookmarkItems: state => state.bookmark.items
        })
    },
    data() {
        return {
            isHovering: false,
            isShowLoading: false,
            objectFocusVideoUrl: null,
            objectOriginVideoUrl: null,
            isShowObjectFocusVideo: true
        };
    },
    methods: {
        ...mapActions({
            getObjectFocusVideo: 'video/getObjectFocusVideo',
            getObjectOriginVideo: 'video/getObjectOriginVideo',
            updateOrCreateBookmark: 'bookmark/updateOrCreate',
            updateBookmarkState: 'bookmark/updateState',
            deleteBookmark: 'bookmark/delete'
        }),
        getVideoObjectImageUrl,
        getObjectTime,
        clickEvent() {
            this.$emit('click');
        },
        // Case object detail modal
        async showObjectDetailModal() {
            this.isShowLoading = true;
            this.$refs.objectDetailModal.show();

            const { server, video, frames } = this.object;
            const params = {
                server,
                data: {
                    videoId: video.id,
                    objectId: this.object.id,
                    filename: video.filename,
                    startFrame: frames[0].frame,
                    x: frames[0].box[0],
                    y: frames[0].box[1],
                    w: frames[0].box[2],
                    h: frames[0].box[3]
                }
            };

            const objectFocusVideo = await this.getObjectFocusVideo(params);
            this.objectFocusVideoUrl = objectFocusVideo.url;

            this.getObjectOriginVideo(params).then(response => {
                this.objectOriginVideoUrl = response.url;
            });

            this.isShowLoading = false;
        },
        changeObjectVideoType() {
            if (!this.objectFocusVideoUrl || !this.objectOriginVideoUrl) return;
            this.isShowObjectFocusVideo = !this.isShowObjectFocusVideo;
            this.$refs.videoPlayerRef.src = this.isShowObjectFocusVideo
                ? this.objectFocusVideoUrl
                : this.objectOriginVideoUrl;
            this.$refs.videoPlayerRef.play();
        },
        toggleAddToReport() {
            if (this.isBookmarked()) {
                this.openDeleteBookmarkModal();
            } else {
                this.updateOrCreateBookmark({
                    caseId: parseInt(this.object.caseId),
                    type: CONSTANTS.BOOKMARK_TYPES.OBJECT,
                    content: this.object
                }).then(response => {
                    this.updateBookmarkState({
                        stateName: 'items',
                        value: [...this.bookmarkItems, response]
                    });
                    this.$toaster.success(this.$t('caseDetail.objectItem.addToReportSuccess'));
                });
            }
        },
        findSimilarObject() {
            this.$emit('findSimilarObject', {
                colors: this.object.colors || [],
                classes: this.object.class ? [this.object.class] : []
            });
            this.$refs.objectDetailModal.hide();
        },
        isBookmarked() {
            const index = this.bookmarkItems.findIndex(
                item =>
                    item.type === CONSTANTS.BOOKMARK_TYPES.OBJECT &&
                    item.content.video.id === this.object.video.id &&
                    item.content.id === this.object.id
            );
            return index > -1;
        },
        // Delete bookmark modal
        openDeleteBookmarkModal() {
            this.$refs.deleteBookmarkModal.show();
        },
        handleDeleteBookmarkOk(modal) {
            // Prevent modal from closing'
            if (modal) {
                modal.preventDefault();
            }
            // Trigger submit handler
            const removeIndex = this.bookmarkItems.findIndex(
                item =>
                    item.type === CONSTANTS.BOOKMARK_TYPES.OBJECT &&
                    item.content.video.id === this.object.video.id &&
                    item.content.id === this.object.id
            );
            const removeBookmarkItem = this.bookmarkItems[removeIndex];

            this.deleteBookmark({
                id: removeBookmarkItem.id
            }).then(() => {
                const newBookmarkItems = _.cloneDeep(this.bookmarkItems);
                newBookmarkItems.splice(removeIndex, 1);
                this.updateBookmarkState({
                    stateName: 'items',
                    value: newBookmarkItems
                });
                this.$refs.deleteBookmarkModal.hide();
                this.$toaster.success(this.$t('caseDetail.bookmark.deleteSuccessMsg'));
            });
        }
    }
};
</script>

<style lang="scss" scoped>
</style>
