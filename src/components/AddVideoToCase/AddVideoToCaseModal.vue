<template>
    <!-- Add video to case -->
    <b-modal
        id="add-videos-to-case-modal"
        ref="addVideoModal"
        :title="$t('cases.addVideo')"
        no-close-on-esc
        no-close-on-backdrop
        size="xl"
        dialog-class="h-90"
        content-class="h-100"
        body-class="overflow-hidden p-0"
    >
        <div
            class="h-100 justify-content-center align-items-center"
            :class="{
                'd-none': addVideoCurrentStep !== 1,
                'd-flex': addVideoCurrentStep === 1
            }"
        >
            <b-button
                :variant="
                    selectedVideoSource == CONSTANTS.ADD_VIDEO_SOURCES.UPLOAD
                        ? 'primary'
                        : 'outline-primary'
                "
                class="add-video-select-source-btn mx-3"
                @click="selecteVideoSource(CONSTANTS.ADD_VIDEO_SOURCES.UPLOAD)"
            >
                <div class="mb-3 text-uppercase">{{ $t('cases.addVideoUpload') }}</div>
                <i class="fa fa-upload fa-4x" aria-hidden="true"></i>
            </b-button>
            <b-button
                :variant="
                    selectedVideoSource == CONSTANTS.ADD_VIDEO_SOURCES.VMS_IMPORT
                        ? 'primary'
                        : 'outline-primary'
                "
                class="add-video-select-source-btn mx-3"
                @click="selecteVideoSource(CONSTANTS.ADD_VIDEO_SOURCES.VMS_IMPORT)"
            >
                <div class="mb-3 text-uppercase">{{ $t('cases.addVideoVmsImport') }}</div>
                <i class="fa fa-download fa-4x" aria-hidden="true"></i>
            </b-button>
            <b-button
                :variant="
                    selectedVideoSource == CONSTANTS.ADD_VIDEO_SOURCES.EXISTED_VIDEO
                        ? 'primary'
                        : 'outline-primary'
                "
                class="add-video-select-source-btn mx-3"
                @click="selecteVideoSource(CONSTANTS.ADD_VIDEO_SOURCES.EXISTED_VIDEO)"
            >
                <div class="mb-3 text-uppercase">{{ $t('cases.addVideoChooseVideo') }}</div>
                <i class="fa fa-file-video-o fa-4x" aria-hidden="true"></i>
            </b-button>
        </div>

        <div v-if="addVideoCurrentStep >= 2" v-show="addVideoCurrentStep === 2" class="h-100">
            <upload-videos
                v-if="
                    selectedVideoSource == CONSTANTS.ADD_VIDEO_SOURCES.UPLOAD &&
                        addVideoCurrentStep === 2
                "
                @updateSelectedVideos="updateSelectedVideos"
                @finishedUploading="jumbStep(1)"
            ></upload-videos>

            <vms-import
                v-if="selectedVideoSource == CONSTANTS.ADD_VIDEO_SOURCES.VMS_IMPORT"
                @updateSelectedVideos="updateSelectedVideos"
            ></vms-import>

            <choose-videos
                v-if="selectedVideoSource == CONSTANTS.ADD_VIDEO_SOURCES.EXISTED_VIDEO"
                @updateSelectedVideos="updateSelectedVideos"
            ></choose-videos>
        </div>

        <div v-show="addVideoCurrentStep === 3" class="h-100">
            <table class="table table-dark">
                <thead>
                    <tr>
                        <th scope="col">#</th>
                        <th scope="col">Video</th>
                        <th scope="col">{{ $t('cases.confirmFileName') }}</th>
                        <th scope="col">{{ $t('cases.confirmTitle') }}</th>
                        <th scope="col">{{ $t('cases.confirmTime') }}</th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-for="(video, index) in selectedVideos" :key="video.id">
                        <th scope="row">{{ index + 1 }}</th>
                        <td>
                            <div class="case-video-thumbnail-container fix-width-sm">
                                <case-video-thumbnail
                                    rounded
                                    :videoPlaceholder="
                                        selectedVideoSource === CONSTANTS.ADD_VIDEO_SOURCES.UPLOAD
                                    "
                                    :vmsVideo="
                                        selectedVideoSource ===
                                            CONSTANTS.ADD_VIDEO_SOURCES.VMS_IMPORT
                                    "
                                    :video="video"
                                    :size="CONSTANTS.VIDEO_SNAPSHOT_SIZE.SMALL"
                                    class="border border-gray-500"
                                />
                            </div>
                        </td>
                        <td>{{ video.filename }}</td>
                        <td>{{ video.name }}</td>
                        <td>
                            <DateTimePicker
                                required
                                v-if="selectedVideoSource === CONSTANTS.ADD_VIDEO_SOURCES.UPLOAD"
                                @updateValue="video.time = $event"
                            ></DateTimePicker>
                            <span v-if="selectedVideoSource !== CONSTANTS.ADD_VIDEO_SOURCES.UPLOAD">
                                {{ video.time | formatDateTime }}
                            </span>
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>

        <template slot="modal-footer">
            <b-row class="w-100">
                <b-col cols="4" offset="4">
                    <vue-step :now-step="addVideoCurrentStep" :step-list="addVideoSteps"></vue-step>
                </b-col>

                <b-col cols="4">
                    <div class="d-flex align-items-center justify-content-end h-100">
                        <b-button class="mr-3" @click="jumbStep(-1)" :disabled="!isBackable()">
                            {{ $t('common.back') }}
                        </b-button>
                        <b-button
                            variant="primary"
                            @click="jumbStep(1)"
                            :disabled="!isNextable()"
                            v-if="addVideoCurrentStep < addVideoSteps.length"
                        >
                            {{ $t('common.next') }}
                        </b-button>

                        <b-button
                            variant="primary"
                            @click="addVideoToCase()"
                            v-if="addVideoCurrentStep == addVideoSteps.length"
                            :disabled="!isValidatedCaseVideos()"
                        >
                            {{
                                selectedVideoSource == CONSTANTS.ADD_VIDEO_SOURCES.EXISTED_VIDEO
                                    ? $t('cases.addVideoBtn')
                                    : $t('cases.processVideoBtn')
                            }}
                        </b-button>
                    </div>
                </b-col>
            </b-row>
        </template>
    </b-modal>
</template>

<script>
import { mapActions } from 'vuex';
import UploadVideos from '../../components/AddVideoToCase/UploadVideos';
import ChooseVideos from '../../components/AddVideoToCase/ChooseVideos';
import VmsImport from '../../components/AddVideoToCase/VmsImport';
import vueStep from 'vue-step';
import { formatServerTime } from '../../filters/datetime';
import CONSTANTS from '../../constants';
import CaseVideoThumbnail from '@/components/CaseVideoThumbnail';
import DateTimePicker from '../../components/DateTimePicker';

export default {
    components: {
        UploadVideos,
        ChooseVideos,
        VmsImport,
        vueStep,
        CaseVideoThumbnail,
        DateTimePicker
    },
    mounted() {
        this.$root.$on('bv::modal::show', (bvEvent, modalId) => {
            if (modalId === 'add-videos-to-case-modal') {
                this.caseItemIdData = parseInt(this.caseItemId);
                this.addVideoCurrentStep = 1;
                this.selectedVideoSource = null;
                this.selectedVideos = [];
            }
        });
    },
    props: {
        caseItemId: {
            type: Number | String,
            default: null
        }
    },
    data() {
        return {
            CONSTANTS,
            selectedVideos: [],
            addVideoCurrentStep: 1,
            addVideoSteps: [
                this.$t('cases.addVideoStep1'),
                this.$t('cases.addVideoStep2'),
                this.$t('cases.addVideoStep3')
            ],
            selectedVideoSource: null,
            caseItemIdData: parseInt(this.caseItemId)
        };
    },
    watch: {
        caseItemId(value) {
            this.caseItemIdData = parseInt(value);
            this.addVideoCurrentStep = 1;
            this.selectedVideoSource = null;
            this.selectedVideos = [];
        }
    },
    methods: {
        ...mapActions({
            createMultipleCaseVideo: 'caseVideo/createMultiple',
            updateOrCreateVideo: 'video/updateOrCreate'
        }),
        jumbStep(offset = 1) {
            this.addVideoCurrentStep += offset;

            if (this.addVideoCurrentStep === 1) {
                this.selectedVideos = [];
            } else if (
                this.addVideoCurrentStep === 2 &&
                this.selectedVideoSource === CONSTANTS.ADD_VIDEO_SOURCES.UPLOAD
            ) {
                this.selectedVideos = [];
            }
        },
        isBackable() {
            return this.addVideoCurrentStep > 1;
        },
        isNextable() {
            let isNextable = this.addVideoCurrentStep < this.addVideoSteps.length;
            if (this.addVideoCurrentStep === 1) {
                isNextable = isNextable && this.selectedVideoSource;
            } else if (this.addVideoCurrentStep === 2) {
                isNextable = isNextable && this.selectedVideos.length > 0;
            }
            return isNextable;
        },
        selecteVideoSource(source) {
            this.selectedVideoSource = source;
            this.addVideoCurrentStep = 2; // Jump to next step
        },
        updateSelectedVideos(selectedVideos) {
            this.selectedVideos = selectedVideos;
        },
        isValidatedCaseVideos() {
            const emptyTimeVideoIndex = this.selectedVideos.findIndex(v => !v.time);
            return this.selectedVideos.length && emptyTimeVideoIndex === -1;
        },
        async addVideoToCase() {
            if (!this.selectedVideos.length) return;

            let readyVideos = [];

            if (this.selectedVideoSource !== CONSTANTS.ADD_VIDEO_SOURCES.EXISTED_VIDEO) {
                readyVideos = await Promise.all(
                    this.selectedVideos.map(video => {
                        video.time = formatServerTime(video.time);
                        return this.updateOrCreateVideo(video);
                    })
                );
            } else {
                readyVideos = this.selectedVideos;
            }

            this.createMultipleCaseVideo(
                readyVideos.map(video => ({
                    caseId: this.caseItemIdData,
                    videoId: video.id
                }))
            ).then(response => {
                this.$refs.addVideoModal.hide();
                this.$toaster.success(this.$t('cases.addVideoSuccessMsg'));
                this.$emit('addVideoToCaseSuccess', response);
            });
        }
    }
};
</script>

<style lang="scss" scoped>
</style>
