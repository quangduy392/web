<template>
    <div>
        <div class="mb-2" v-line-clamp="1">{{ video.name }}</div>

        <case-video-thumbnail
            :video="video"
            rounded
            class="border mb-2"
            :showPlayButton="hover"
            showVideoTime
            @playVideo="showBriefVideo"
            :class="{ 'border-info': hover, 'border-gray-500': !hover }"
            @mouseover="hover = true"
            @mouseleave="hover = false"
        />
        <div class="d-flex justify-content-between align-items-center font-13">
            <i
                class="fa fa-crosshairs"
                :class="{
                    'cursor-pointer': video.status === CONSTANTS.VIDEO_STATUS.DONE,
                    'text-gray-300': video.status !== CONSTANTS.VIDEO_STATUS.DONE
                }"
                aria-hidden="true"
                v-b-tooltip.hover
                :title="$t('caseDetail.videoItem.activities')"
                @click="openVisualLayer(CONSTANTS.VISUAL_LAYER_TYPES.ACTIVITES)"
            ></i>
            <!-- <b-dropdown no-caret class="case-detail-video-item_visual-layer-btn">
                <template slot="button-content">
                    <i
                        class="fa fa-cog"
                        aria-hidden="true"
                        v-b-tooltip.hover
                        title="Visual layers"
                    ></i>
                </template>
                <b-dropdown-item href="#">
                    <i class="fa fa-crosshairs" aria-hidden="true"></i>
                    {{ $t('caseDetail.videoItem.activities') }}
                </b-dropdown-item>
                <b-dropdown-item href="#">
                    <i class="fa fa-thermometer-quarter" aria-hidden="true"></i>
                    {{ $t('caseDetail.videoItem.dwell') }}
                </b-dropdown-item>
                <b-dropdown-item href="#">
                    <i class="fa fa-exchange" aria-hidden="true"></i>
                    {{ $t('caseDetail.videoItem.path') }}
                </b-dropdown-item>
                <b-dropdown-item href="#">
                    <i class="fa fa-arrows-h" aria-hidden="true"></i>
                    {{ $t('caseDetail.videoItem.backgroundChanges') }}
                </b-dropdown-item>
            </b-dropdown>-->
            <div class="text-center">
                <span
                    class="cursor-pointer"
                    @click="showDefineAreaAndPathModalVideo('area')"
                    :class="{
                        'text-gray-300':
                            video.status !== CONSTANTS.VIDEO_STATUS.DONE ||
                            !video.areas ||
                            !video.areas.length,
                        'cursor-pointer': video.status === CONSTANTS.VIDEO_STATUS.DONE
                    }"
                >{{ $t('caseDetail.videoItem.area') }}</span>
                |
                <span
                    class="cursor-pointer"
                    @click="showDefineAreaAndPathModalVideo('path')"
                    :class="{
                        'text-gray-300':
                            video.status !== CONSTANTS.VIDEO_STATUS.DONE ||
                            !video.paths ||
                            !video.paths.length,
                        'cursor-pointer': video.status === CONSTANTS.VIDEO_STATUS.DONE
                    }"
                >{{ $t('caseDetail.videoItem.path') }}</span>
            </div>
            <div>
                <span
                    class="text-success"
                    v-if="showObjectCount"
                    v-b-tooltip.hover
                    :title="$t('caseDetail.videoItem.objectCount')"
                >{{ getCountDisplay() }}</span>
            </div>
        </div>

        <!-- Visual layer modal -->
        <b-modal
            ref="visualLayerModal"
            hide-header
            hide-footer
            size="xl"
            centered
            body-class="border border-gray-500 p-0"
        >
            <div class="ratio-16-9 position-relative" v-if="isShowVisualLayerLoading">
                <div
                    class="obsolute-full d-flex flex-column justify-content-center align-items-center"
                >
                    <img src="/static/img/loader-green.gif" class="standalone-loading" />
                </div>
            </div>
            <b-img
                class="w-100"
                :src="visualLayerImageUrl"
                v-if="!isShowVisualLayerLoading && visualLayerImageUrl"
            ></b-img>
        </b-modal>

        <!-- Play video modal -->
        <b-modal
            ref="playVideoModal"
            :title="video.name"
            hide-header
            hide-footer
            size="xl"
            centered
            body-class="ratio-16-9 position-relative border border-gray-500"
        >
            <div
                class="obsolute-full d-flex flex-column justify-content-center align-items-center"
                v-if="isBriefVideoLoading"
            >
                <img src="/static/img/loader-green.gif" class="standalone-loading" />
            </div>
            <video
                controls
                autoplay
                width="100%"
                height="auto"
                ref="video"
                muted
                class="obsolute-full"
                v-if="!isBriefVideoLoading && brefVideoUrl"
            >
                <source :src="brefVideoUrl" type="video/mp4" />
            </video>
        </b-modal>

        <!-- Define area -->
        <b-modal
            id="define-area-modal"
            ref="defineAreaModal"
            size="lg"
            hide-header
            centered
            no-close-on-esc
            no-close-on-backdrop
            body-class="p-0 position-relative border border-gray-500"
        >
            <b-img ref="videoThumbnail" class="w-100" :src="getVideoBackgroundUrl(video.id)"></b-img>
            <div
                class="position-absolute w-100 text-center mt-2 font-weight-bold"
                style="top: 0;"
            >{{ $t('draw.clickToDrawArea') }}</div>
            <v-stage
                ref="stage"
                @click="onStageClick"
                @mousemove="mouseMove"
                @mousedown="mouseDown"
                @mouseup="mouseUp"
                class="obsolute-full area-drawing-stage"
                :config="stageConfig"
                v-if="stageConfig"
            >
                <v-layer v-if="drawingMode === 'area'">
                    <!-- area -->
                    <v-line
                        v-for="(area, index) in areas"
                        :key="`area-${index}`"
                        :config="{
                            points: getAreaPathPoints(area.points),
                            closed: true,
                            stroke: 'black',
                            opacity: 0.5,
                            lineJoin: 'round',
                            fill: 'red'
                        }"
                    />
                    <!-- <template v-for="(area, aIndex) in areas">
                        <v-circle
                            v-for="(point, pIndex) in area"
                            :key="`ap-${aIndex}-${pIndex}`"
                            :config="{
                                ...point,
                                radius: 4,
                                fill: 'white'
                            }"
                        />
                    </template>-->
                    <v-text
                        v-for="(area, index) in areas"
                        :key="`area-title-${index}`"
                        :config="getAreaTitleConfig(area)"
                    />

                    <!-- Drawing area -->
                    <v-line
                        :config="{
                            points: getAreaPathPoints(this.areaPoints),
                            closed: false,
                            stroke: 'black',
                            opacity: 0.5,
                            lineJoin: 'round',
                            fill: 'green'
                        }"
                    />
                    <v-circle
                        v-for="(point, pIndex) in areaPoints"
                        :key="'p' + pIndex"
                        :config="{
                            ...point,
                            radius: pIndex === hovingPoint ? 10 : 5,
                            fill: 'orange',
                            strokeWidth: 4
                        }"
                    />
                </v-layer>

                <v-layer v-if="drawingMode === 'path'">
                    <!-- path -->
                    <v-arrow
                        v-for="(path, index) in paths"
                        :key="`path-${index}`"
                        :config="{
                            points: getPathPoints(path.points),
                            closed: false,
                            stroke: 'red',
                            strokeWidth: 8,
                            lineJoin: 'round',
                            pointerLength : 10,
                            pointerWidth : 12
                        }"
                    />
                    <v-text
                        v-for="(path, index) in paths"
                        :key="`path-title-${index}`"
                        :config="getPathTitleConfig(path)"
                    />
                    <!-- Drawing path -->
                    <v-arrow
                        :config="{
                            points: getPathPoints(this.pathPoints),
                            closed: false,
                            stroke: 'green',
                            strokeWidth: 8,
                            lineJoin: 'round',
                            pointerLength : 10,
                            pointerWidth : 12
                        }"
                    />
                </v-layer>
            </v-stage>

            <template slot="modal-footer">
                <div class="w-100 d-flex justify-content-between align-items-center">
                    <div>
                        <b-button
                            variant="danger"
                            class="mr-2 min-width-none"
                            v-b-tooltip.hover
                            :title="$t(drawingMode === 'area' ? 'draw.deleteAllAreas' : 'draw.deleteAllPaths')"
                            @click="deleteAreasAndPaths"
                        >
                            <i class="fa fa-trash" aria-hidden="true"></i>
                            <b-badge
                                variant="light"
                            >{{ drawingMode === 'area' ? areas.length : paths.length }}</b-badge>
                        </b-button>

                        <b-button
                            variant="warning"
                            class="mr-2 min-width-none"
                            v-b-tooltip.hover
                            :title="$t('draw.deleteLastPoint')"
                            @click="deleteLastAreaPoint"
                            v-if="areaPoints.length"
                        >
                            <i class="fa fa-undo" aria-hidden="true"></i>
                        </b-button>
                        <!-- <b-button
                            variant="success"
                            class="mr-2 min-width-none"
                            v-b-tooltip.hover
                            :title="$t('draw.finishDrawingArea')"
                            @click="finshDrawingAreaAndPath"
                            v-if="areaPoints.length >= 3"
                        >
                            <i class="fa fa-check" aria-hidden="true"></i>
                        </b-button>-->
                    </div>

                    <div>
                        <div class="d-flex align-items-center justify-content-end h-100">
                            <b-button
                                class="mr-2"
                                @click="$refs.defineAreaModal.hide()"
                            >{{ $t('common.cancel') }}</b-button>
                            <b-button
                                variant="primary"
                                @click="saveArea"
                                :disabled="
                                    !stageConfig ||
                                        !backgroundImageDimensions ||
                                        areaPoints.length > 0
                                "
                            >{{ $t('common.ok') }}</b-button>
                        </div>
                    </div>
                </div>
            </template>
        </b-modal>

        <!-- save area/path modal -->
        <b-modal
            ref="saveAreaPathModal"
            :title="$t('caseDetail.videoItem.areaPathSaveTitle')"
            no-close-on-esc
            no-close-on-backdrop
            :cancel-title="$t('common.cancel')"
            @ok="handleSaveAreaPathOk"
            @cancel="handleSaveAreaPathCancel"
        >
            <form @submit.prevent="submitSaveAreaPathForm">
                <b-form-group :label="$t('caseDetail.videoItem.areaPathNameLabel')">
                    <b-form-input
                        maxlength="255"
                        v-model.trim="areaPathName"
                        :placeholder="$t('caseDetail.videoItem.areaPathNameLabel')"
                        name="areaPathName"
                        v-validate.disabled="'required'"
                        data-vv-validate-on="none"
                        :data-vv-as="$t('caseDetail.videoItem.areaPathNameLabel')"
                        autofocus
                        autocomplete="off"
                    ></b-form-input>
                    <div
                        v-show="errors.has('areaPathName')"
                        class="validation-message text-danger"
                    >{{ errors.first('areaPathName') }}</div>
                </b-form-group>
            </form>
        </b-modal>
    </div>
</template>

<script>
import { mapActions } from 'vuex';
import CONSTANTS from '@/constants';
import CaseVideoThumbnail from './CaseVideoThumbnail';
import getVideoBackgroundUrl from '@/utils/getVideoBackgroundUrl';
// import getAreaPoints from '@/utils/getAreaPoints';
import _ from 'lodash';

export default {
    name: 'case-detail-video-item',
    components: {
        CaseVideoThumbnail
    },
    props: {
        video: {
            type: Object
        },
        server: {
            type: Object
        },
        showObjectCount: {
            type: Boolean,
            default: false
        },
        objectCount: {
            type: Number,
            default: 0
        },
        displayedObjectCount: {
            type: Number
        }
    },
    mounted() {
        this.$root.$on('bv::modal::show', (bvEvent, modalId) => {
            if (modalId === 'define-area-modal') {
                setTimeout(() => {
                    this.setStageConfig();
                    const displayedRatio =
                        this.stageConfig.width / this.backgroundImageDimensions.width;

                    const videoAreas = this.video.areas ? this.video.areas : this.areas;
                    this.areas = this.convertAreaRatio(videoAreas, displayedRatio);

                    const videoPaths = this.video.paths ? this.video.paths : this.paths;
                    this.paths = this.convertPathRatio(videoPaths, displayedRatio);
                }, 300);
            }
        });

        // Get video background dimensions
        const img = new Image();
        img.onload = () => {
            const { width, height } = img;
            this.backgroundImageDimensions = {
                width,
                height
            };
        };
        img.src = this.getVideoBackgroundUrl(this.video.id);
    },
    data() {
        return {
            CONSTANTS,
            hover: false,
            isShowVisualLayerLoading: false,
            visualLayerImageUrl: null,
            isBriefVideoLoading: false,
            brefVideoUrl: null,
            areaPoints: [], // Drawing area points
            areas: [],
            savedAreaPoints: [],
            stageConfig: null,
            backgroundImageDimensions: null,
            areaPathName: '',
            hovingPoint: null,
            drawingMode: 'area', // Area or Path
            paths: [],
            pathPoints: [], // Drawing path ponts
            isPathDrawing: false
        };
    },
    methods: {
        ...mapActions({
            getVideoHeatMapImage: 'video/getHeatMapImage',
            getBriefVideo: 'video/getBriefVideo',
            updateOrCreateVideo: 'video/updateOrCreate'
        }),
        getVideoBackgroundUrl,
        showBriefVideo() {
            // Play video modal
            this.isBriefVideoLoading = true;
            this.$refs.playVideoModal.show();
            this.getBriefVideo({
                server: this.server,
                data: {
                    videoId: this.video.id,
                    filename: this.video.filename
                }
            }).then(response => {
                this.isBriefVideoLoading = false;
                this.brefVideoUrl = response.url;
            });
        },
        getCountDisplay() {
            if (
                typeof this.displayedObjectCount === 'undefined' ||
                this.displayedObjectCount === this.objectCount
            ) {
                return this.objectCount;
            } else {
                return `${this.displayedObjectCount}/${this.objectCount}`;
            }
        },
        openVisualLayer(type) {
            if (this.video.status === CONSTANTS.VIDEO_STATUS.DONE) {
                this.isShowVisualLayerLoading = true;
                this.$refs.visualLayerModal.show();
                this.getVideoHeatMapImage({
                    server: this.server,
                    data: {
                        videoId: this.video.id,
                        type
                    }
                }).then(response => {
                    const bytes = new Uint8Array(response);
                    const binary = bytes.reduce((data, b) => (data += String.fromCharCode(b)), '');
                    this.visualLayerImageUrl = 'data:image/jpeg;base64,' + btoa(binary);
                    this.isShowVisualLayerLoading = false;
                });
            }
        },
        // Area/Path define modal
        showDefineAreaAndPathModalVideo(drawingMode) {
            this.drawingMode = drawingMode;
            if (this.video.status === CONSTANTS.VIDEO_STATUS.DONE) {
                this.stageConfig = null;
                this.areaPoints = [];
                this.pathPoints = [];
                this.$refs.defineAreaModal.show();
            }
        },
        onStageClick() {
            if (this.drawingMode === 'area') {
                const mousePos = this.$refs.stage.getStage().getPointerPosition();
                if (
                    this.areaPoints.length >= 3 &&
                    this.calcDistance(mousePos, this.areaPoints[0]) < 100
                ) {
                    this.finshDrawingAreaAndPath();
                } else {
                    this.areaPoints.push(mousePos);
                }
            }
        },
        mouseDown() {
            const mousePos = this.$refs.stage.getStage().getPointerPosition();

            if (this.drawingMode === 'path') {
                this.pathPoints = [mousePos];
                this.isPathDrawing = true;
            }
        },
        mouseMove() {
            const mousePos = this.$refs.stage.getStage().getPointerPosition();
            if (this.drawingMode === 'area' && this.areaPoints.length) {
                if (this.calcDistance(mousePos, this.areaPoints[0]) < 100) {
                    this.hovingPoint = 0;
                } else {
                    this.hovingPoint = null;
                }
            }

            if (this.drawingMode === 'path' && this.isPathDrawing) {
                if (
                    this.calcDistance(mousePos, this.pathPoints[this.pathPoints.length - 1]) >= 100
                ) {
                    this.pathPoints.push(mousePos);
                }
            }
        },
        mouseUp() {
            // const mousePos = this.$refs.stage.getStage().getPointerPosition();

            if (this.drawingMode === 'path') {
                this.isPathDrawing = false;

                this.finshDrawingAreaAndPath();
            }
        },
        calcDistance(point1, point2) {
            return (
                (point1.x - point2.x) * (point1.x - point2.x) +
                (point1.y - point2.y) * (point1.y - point2.y)
            );
        },
        // Save Area/Path
        finshDrawingAreaAndPath() {
            // Reset form
            this.areaPathName = '';
            this.$refs.saveAreaPathModal.show();
        },
        handleSaveAreaPathOk(modal) {
            // Prevent modal from closing
            modal.preventDefault();
            // Trigger submit handler
            this.submitSaveAreaPathForm();
        },
        submitSaveAreaPathForm: function() {
            this.$validator.validateAll().then(result => {
                if (result) {
                    if (this.drawingMode === 'area') {
                        this.areas.push({
                            title: this.areaPathName,
                            points: this.areaPoints
                        });
                        this.areaPoints = [];
                    } else if (this.drawingMode === 'path') {
                        this.paths.push({
                            title: this.areaPathName,
                            points: this.pathPoints
                        });
                        this.pathPoints = [];
                    }

                    this.$refs.saveAreaPathModal.hide();
                }
            });
        },
        handleSaveAreaPathCancel(modal) {
            if (this.drawingMode === 'path') {
                this.pathPoints = [];
            }
        },
        setStageConfig() {
            this.stageConfig = {
                width: this.$refs.videoThumbnail.clientWidth,
                height: this.$refs.videoThumbnail.clientHeight
            };
        },
        getAreaPathPoints(areaPoints) {
            const tmpPoints = _.cloneDeep(areaPoints);
            const points = tmpPoints; // getAreaPoints(tmpPoints);
            const areaPathPoints = [];
            points.forEach(point => {
                areaPathPoints.push(point.x);
                areaPathPoints.push(point.y);
            });
            return areaPathPoints;
        },
        getPathPoints(pathPoints) {
            const points = _.cloneDeep(pathPoints);
            const returnedPathPoints = [];
            points.forEach(point => {
                returnedPathPoints.push(point.x);
                returnedPathPoints.push(point.y);
            });
            return returnedPathPoints;
        },
        deleteLastAreaPoint() {
            this.areaPoints.pop();
        },
        deleteAreasAndPaths() {
            if (this.drawingMode === 'area') {
                this.areas = [];
            } else if (this.drawingMode === 'path') {
                this.paths = [];
            }
        },
        async saveArea() {
            if (this.backgroundImageDimensions && this.stageConfig) {
                // convert to original ratio
                const originalRatio = this.backgroundImageDimensions.width / this.stageConfig.width;

                await this.updateOrCreateVideo({
                    ...this.video,
                    areas: this.convertAreaRatio(this.areas, originalRatio),
                    paths: this.convertPathRatio(this.paths, originalRatio)
                });
                this.$emit('updateCaseVideoItem');
                this.$refs.defineAreaModal.hide();
            }
        },
        convertAreaRatio(areas, ratio) {
            const resultAreas = [];
            let resultPoints = [];

            areas.forEach(area => {
                const areaPoints = area.points;
                resultPoints = [];
                resultPoints = areaPoints.map(point => ({
                    x: point.x * ratio,
                    y: point.y * ratio
                }));
                resultAreas.push({
                    ...area,
                    points: resultPoints
                });
            });

            return resultAreas;
        },
        convertPathRatio(paths, ratio) {
            const resultPaths = [];
            let resultPoints = [];

            paths.forEach(path => {
                const pathPoints = path.points;
                resultPoints = [];
                resultPoints = pathPoints.map(point => ({
                    x: point.x * ratio,
                    y: point.y * ratio
                }));
                resultPaths.push({
                    ...path,
                    points: resultPoints
                });
            });

            return resultPaths;
        },
        getAreaTitleConfig(area) {
            let areaXSum = 0;
            let areaYSum = 0;
            area.points.forEach(point => {
                areaXSum += point.x;
                areaYSum += point.y;
            });
            return {
                text: area.title,
                width: 100,
                height: 30,
                fill: 'white',
                align: 'center',
                x: areaXSum / area.points.length - 50,
                y: areaYSum / area.points.length - 15
            };
        },
        getPathTitleConfig(path) {
            if (path.points.length) {
                const lastPointOfPath = path.points[path.points.length - 1];
                return {
                    text: path.title,
                    width: 100,
                    height: 30,
                    fill: 'white',
                    align: 'center',
                    x: lastPointOfPath.x - 50,
                    y: lastPointOfPath.y - 15
                };
            }
        }
    }
};
</script>

<style lang="scss" scoped>
</style>
