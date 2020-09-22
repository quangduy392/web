<template>
    <div class="animated fadeIn h-100">
        <sub-header hideBreadcrumb>
            <template slot="sub-header-left">
                <b-navbar-nav class="d-flex flex-row">
                    <b-nav-item class="text-nowrap" active>{{
                        $t('alert.commonTitle')
                    }}</b-nav-item>
                </b-navbar-nav>
            </template>
            <template slot="sub-header-middle"></template>
            <template slot="sub-header-right">
                <b-form-select
                    :options="typeOptions"
                    v-model="typeSelected"
                    v-if="!isBrushing"
                    class="floorplan-select form-control bg-transparent text-primary mr-1 border-primary"
                    @change="onChangeFunction"
                ></b-form-select>
                <b-button class="mr-1" variant="danger" @click="deleteLastObject" v-if="isBrushing">
                    <i class="fa fa-trash mr-2"></i>
                    <span>
                        {{ drawing ? $t('draw.deleteLastPoint') : $t('draw.deleteLastRegion') }}
                    </span>
                </b-button>
                <b-button
                    class="mr-1"
                    variant="danger"
                    v-b-modal.delete-region-modal
                    v-if="isBrushing"
                >
                    <i class="fa fa-trash mr-2"></i>
                    <span>{{ $t('draw.deleteAllAreas') }}</span>
                </b-button>
                <b-button
                    variant="outline-primary"
                    class="mr-1"
                    v-if="!isBrushing"
                    @click="startBrushing"
                >
                    <i class="fa fa-paint-brush"></i>
                    <span class="text-uppercase">Khoanh vùng</span>
                </b-button>
                <b-button variant="outline-primary" @click="stopBrushing" v-if="isBrushing">
                    <span class="text-uppercase">{{ $t('common.cancel') }}</span>
                </b-button>
            </template>
        </sub-header>

        <div class="page-content sub-header-page-content">
            <div class="d-flex h-100" ref="container" style="position: relative;">
                <b-img ref="videoThumbnail" class="w-100" :src="getBackgroundImageUrl()"></b-img>
                <v-stage
                    ref="stage"
                    class="obsolute-full"
                    :class="isBrushing ? 'area-drawing-stage' : ''"
                    @click="onStageClick"
                    @mousemove="mouseMove"
                    :config="stageConfig"
                    v-if="stageConfig"
                >
                    <v-layer>
                        <!-- Grid -->
                        <v-line
                            v-for="g in grid.x"
                            v-if="isBrushing"
                            :config="{
                                points: g,
                                stroke: 'black',
                                strokeWidth: 0.7,
                                opacity: 0.3
                            }"
                        />
                        <v-line
                            v-for="g in grid.y"
                            v-if="isBrushing"
                            :config="{
                                points: g,
                                stroke: 'black',
                                strokeWidth: 0.7,
                                opacity: 0.3
                            }"
                        />
                        <!-- End grid -->

                        <v-line
                            v-for="(area, index) in areas"
                            :key="`area-${index}`"
                            :config="{
                                points: getAreaPathPoints(area.points),
                                closed: true,
                                stroke: 'black',
                                opacity: 0.5,
                                lineJoin: 'round',
                                fill: area.background
                            }"
                        />
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
                </v-stage>
            </div>
        </div>
        <!-- Delete all region modal -->
        <b-modal
            centered
            id="delete-region-modal"
            :title="$t('common.confirmation')"
            no-close-on-esc
            no-close-on-backdrop
            :ok-title="$t('common.delete')"
            :cancel-title="$t('common.cancel')"
            ok-variant="danger"
            @ok="deleteAllRegions"
            >{{ $t('draw.confirmDelete') }}</b-modal
        >

        <!-- Select zone -->
        <b-modal
            centered
            id="update-camera-zone-modal"
            title="Chọn vùng"
            no-close-on-esc
            no-close-on-backdrop
            :ok-title="$t('common.update')"
            :cancel-title="$t('common.cancel')"
            @ok="updateZoneRegions"
        >
            <form @submit.prevent="submitUpdateZoneRegions">
                <b-form-select
                    :options="zones"
                    style="padding-top: unset; padding-bottom: unset;"
                    v-model="zoneSelected"
                    text-field="name"
                    v-validate="'required'"
                    name="type"
                    data-vv-as="Vùng"
                    value-field="id"
                ></b-form-select>
                <div v-show="errors.has('type')" class="validation-message text-danger">
                    {{ errors.first('type') }}
                </div>
            </form>
        </b-modal>
        <!-- camera modal -->
        <b-modal
            id="modal-camera"
            hide-header
            hide-footer
            size="xl"
            centered
            body-class="border border-gray-500 p-0"
        >
            <div class="ratio-16-9 position-relative">
                <div
                    class="obsolute-full d-flex flex-column justify-content-center align-items-center"
                >
                    <img src="/static/img/loader-green.gif" class="standalone-loading" />
                </div>
                <div class="obsolute-full overflow-hidden">
                    <b-img :src="selectedCamera.liveUrl" class="w-100"></b-img>
                </div>
                <div style="position: absolute; top: 9px; left:15px;" class="event-text-color">
                    <div>{{ selectedCamera.name }}</div>
                </div>
                <span style="position: absolute; top: 2px; right:5px; z-index: 1">
                    <i
                        @click="$bvModal.hide('modal-camera')"
                        class="fa fa-lg fa-times cursor-pointer"
                    ></i>
                </span>
            </div>
        </b-modal>
    </div>
</template>

<script>
import { mapActions, mapState } from 'vuex';
import _ from 'lodash';
import CONSTANTS from '@/constants';
import moment from 'moment-timezone';
import API_CONFIG from '@/api-config';
const inside = require('point-in-polygon');

export default {
    components: {},
    mounted: function() {
        this.$nextTick(async function() {
            await Promise.all([this.getListMaxBed(), this.getListZoneCamera()]);
            this.getListZones();
            this.getCameraList();
            this.reloadData();
            setTimeout(() => {
                this.generateGrid();
            }, 1000);
        });
    },
    computed: {
        drawing() {
            return this.item.points.length > 0;
        },
        ...mapState({
            rawZones: state => state.zone.items,
            zoneCamera: state => state.zone.zoneCamera,
            message: state => state.websocket.message,
            cameras: state => state.camera.items,
            currentUser: state => state.auth.currentUser,
            maxBeds: state => state.hospitalBed.items
        })
    },
    data() {
        return {
            BASE_URL: API_CONFIG.BASE_URL,
            videoSrc: '',
            typeOptions: [
                { value: 'MB - Benh Vien K - Tan Trieu-1', text: 'Mặt bằng' },
                { value: 'Nha A - KTNV - T1', text: 'Nhà A - KTNV - T1' },
                { value: 'Nha A - KTNV - T2', text: 'Nhà A - KTNV - T2' },
                { value: 'Nha A - KTNV - T3', text: 'Nhà A - KTNV - T3' },
                { value: 'Nha A - KTNV - T4', text: 'Nhà A - KTNV - T4' },
                { value: 'Nha A - KTNV - T5', text: 'Nhà A - KTNV - T5' },
                { value: 'Nha B - Noi Tru - T1', text: 'Nhà B - Nội trú - T1' },
                { value: 'Nha B - Noi Tru - T2', text: 'Nhà B - Nội trú - T2' },
                { value: 'Nha B - Noi Tru - T3 - 7', text: 'Nhà B - Nội trú - T3' },
                { value: 'Nha C - Xa Tri - T1', text: 'Nhà C - Xạ trị - T1' },
                { value: 'Nha C - Xa Tri - T2', text: 'Nhà C - Xạ trị - T2' }
            ],
            typeSelected: 'MB - Benh Vien K - Tan Trieu-1',
            zones: [],
            isBrushing: false,
            item: {
                points: []
            },
            hovingPoint: null,
            stageConfig: null,
            zoneSelected: null,
            cameraSelected: null,
            areaPoints: [], // Drawing area points
            areas: [],
            backgroundImageDimensions: { width: 0, height: 0 },
            regions: [],
            filterNewestEventInterval: null,
            fetchDataInterval: null,
            maxEventId: 0,
            eventNewest: [],
            listZoneIdAlert: [],
            selectedEvent: null,
            curMousePos: null,
            selectedCamera: {},
            grid: { x: [], y: [] },
            blockSnapSize: 45
        };
    },
    methods: {
        ...mapActions({
            getCameraList: 'camera/getList',
            getListZones: 'zone/getListZones',
            getListZoneCamera: 'zone/getListZoneCamera',
            updateZone: 'zone/updateZone',
            getNewestEventList: 'event/getNewestEventNoCommit',
            updateOrCreate: 'camera/updateOrCreate',
            getListMaxBed: 'hospitalBed/getListMaxBed'
        }),
        convertAreaRatio(areas, widthRatio, heightRatio) {
            const resultAreas = [];
            let resultPoints = [];

            areas.forEach(area => {
                resultPoints = [];
                resultPoints = area.points.map(point => ({
                    x: point[0] * widthRatio,
                    y: point[1] * heightRatio
                }));
                resultAreas.push({
                    ...area,
                    points: resultPoints
                });
            });
            return resultAreas;
        },
        getBackgroundImageUrl() {
            return `/static/img/hospital/${this.typeSelected}.png`;
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
                height: 40,
                fill: 'white',
                align: 'center',
                x: areaXSum / area.points.length - 50,
                y: areaYSum / area.points.length - 20
            };
        },
        onStageClick(event) {
            if (!this.isBrushing) {
                this.openVideoDialog();
            } else {
                const mousePos = this.$refs.stage.getStage().getPointerPosition();
                if (
                    this.areaPoints.length >= 3 &&
                    this.calcDistance(mousePos, this.areaPoints[0]) < 100
                ) {
                    this.finshDrawingArea();
                } else {
                    this.item.points.push([mousePos.x, mousePos.y]);
                    this.areaPoints.push(mousePos);
                }
            }
        },
        mouseMove() {
            const mousePos = this.$refs.stage.getStage().getPointerPosition();
            if (this.areaPoints.length) {
                if (this.calcDistance(mousePos, this.areaPoints[0]) < 100) {
                    this.hovingPoint = 0;
                } else {
                    this.hovingPoint = null;
                }
            }
        },
        finshDrawingArea() {
            // Reset form
            this.areaPathName = '';
            this.$bvModal.show('update-camera-zone-modal');
        },
        calcDistance(point1, point2) {
            return (
                (point1.x - point2.x) * (point1.x - point2.x) +
                (point1.y - point2.y) * (point1.y - point2.y)
            );
        },
        deleteLastObject() {
            if (this.drawing) {
                this.item.points.pop();
                this.areaPoints.pop();
            } else {
                const temp = this.areas.pop();
                const lastRegion = [];
                const wRatio = this.backgroundImageDimensions.width / this.stageConfig.width;
                const hRatio = this.backgroundImageDimensions.height / this.stageConfig.height;
                temp.points.forEach(item => {
                    lastRegion.push([Math.round(item.x * wRatio), Math.round(item.y * hRatio)]);
                });
                for (const zone of this.zones) {
                    if (!zone.regions || zone.regions.length === 0) continue;
                    if (zone.regions.find(item => _.isEqual(item, lastRegion))) {
                        const curZone = _.cloneDeep(zone);
                        curZone.regions = zone.regions.filter(item => !_.isEqual(item, lastRegion));
                        this.updateZone(curZone);
                        break;
                    }
                }
                this.$toaster.success('Đã xoá vùng cuối thành công');
            }
        },
        async deleteAllRegions() {
            for (const zone of this.zones) {
                if (!zone.regions || zone.regions.length === 0) continue;
                const curZone = _.cloneDeep(zone);
                curZone.regions = [];
                await this.updateZone(curZone);
            }
            this.stopBrushing();
            this.$toaster.success('Đã xoá tất cả các vùng thành công');
        },
        updateZoneRegions(modal) {
            modal.preventDefault();
            this.submitUpdateZoneRegions();
        },
        submitUpdateZoneRegions() {
            this.$validator.validateAll().then(result => {
                if (result) {
                    const curZone = _.cloneDeep(
                        this.zones.filter(item => item.id === this.zoneSelected)[0]
                    );
                    curZone.site = this.typeSelected;
                    if (!curZone.regions) curZone.regions = [];
                    const newArea = [];
                    const wRatio = this.backgroundImageDimensions.width / this.stageConfig.width;
                    const hRatio = this.backgroundImageDimensions.height / this.stageConfig.height;
                    this.areaPoints.forEach(item => {
                        newArea.push([Math.round(item.x * wRatio), Math.round(item.y * hRatio)]);
                    });
                    curZone.regions.push(newArea);
                    this.updateZone(curZone);
                    this.stopBrushing();
                    this.$bvModal.hide('update-camera-zone-modal');
                }
            });
        },
        submitSelectCamera() {
            this.$validator.validateAll().then(async result => {
                if (result) {
                    const curCamera = _.cloneDeep(
                        this.cameras.filter(item => item.id === this.cameraSelected)[0]
                    );
                    const wRatio = this.backgroundImageDimensions.width / this.stageConfig.width;
                    const hRatio = this.backgroundImageDimensions.height / this.stageConfig.height;
                    curCamera.x = Math.round(this.curMousePos.x * wRatio);
                    curCamera.y = Math.round(this.curMousePos.y * hRatio);
                    curCamera.site = this.typeSelected;
                    await this.updateOrCreate(curCamera);
                    this.stopAddCamera();
                    this.$bvModal.hide('select-camera-modal');
                }
            });
        },
        startBrushing() {
            this.areas = [];
            if (this.fetchDataInterval) clearInterval(this.fetchDataInterval);
            this.getListZones();
            this.isBrushing = true;
        },
        stopBrushing() {
            this.isBrushing = false;
            this.areas = [];
            this.areaPoints = [];
            this.item.points = [];
            this.listZoneIdAlert = [];
            this.maxEventId = 0;
            this.reloadData();
            this.scaleArea();
        },
        scaleArea() {
            this.stageConfig = {
                width: this.$refs.videoThumbnail.clientWidth,
                height: this.$refs.videoThumbnail.clientHeight
            };
            this.showAllZone();
        },
        onWindowSizeChange(e) {
            this.scaleArea();
            this.generateGrid();
        },
        async fetchData() {
            const events = await this.getNewestEventList({
                count: CONSTANTS.MAX_ALERT_EVENT,
                greaterthan: this.maxEventId,
                type: 'hospital-bed'
            });
            for (const event of events) {
                if (event.id > this.maxEventId) this.maxEventId = event.id;
                if (this.isNewestEvent(event.createdAt)) {
                    this.eventNewest = this.eventNewest.filter(
                        item => item.cameraId !== event.cameraId
                    );
                    this.eventNewest.push(event);
                }
            }
        },
        async onChangeFunction() {
            this.maxEventId = 0;
            this.areas = [];
            this.listZoneIdAlert = [];
            this.getListZones();
            this.reloadData();
        },
        reloadData() {
            this.fetchData();
            if (this.fetchDataInterval) clearInterval(this.fetchDataInterval);
            this.fetchDataInterval = setInterval(() => {
                this.fetchData();
            }, CONSTANTS.ATTENDANCE_EVENT_INTERVAL);
        },
        isNewestEvent(time) {
            return (
                moment.duration(moment().diff(moment(time))).asMinutes() <=
                CONSTANTS.ALERT_EVENT_TIME_OUT
            );
        },
        showAllZone() {
            const widthRatio = this.stageConfig.width / this.backgroundImageDimensions.width;
            const heightRatio = this.stageConfig.height / this.backgroundImageDimensions.height;
            this.areas = this.convertAreaRatio(this.regions, widthRatio, heightRatio);
        },
        async openVideoDialog() {
            this.selectedCamera = {};
            const mousePos = this.$refs.stage.getStage().getPointerPosition();
            const pointClicked = [mousePos.x, mousePos.y];
            for (const area of this.areas) {
                const points = [];
                for (const point of area.points) {
                    points.push([point.x, point.y]);
                }
                if (inside(pointClicked, points)) {
                    const cameraId = _.find(this.zoneCamera, { zoneId: area.id }).cameraId;
                    this.selectedCamera = _.find(this.cameras, {
                        id: cameraId
                    });
                    break;
                }
            }
            if (!this.selectedCamera || _.keys(this.selectedCamera).length === 0) {
                this.selectedCamera = {};
                return;
            }
            this.$bvModal.show('modal-camera');
        },
        generateGrid() {
            this.grid = { x: [], y: [] };
            for (let i = 0; i < this.stageConfig.width / this.blockSnapSize; i++) {
                this.grid.x.push([
                    Math.round(i * this.blockSnapSize) + 0.5,
                    0,
                    Math.round(i * this.blockSnapSize) + 0.5,
                    this.stageConfig.height
                ]);
            }
            for (let i = 0; i < this.stageConfig.height / this.blockSnapSize; i++) {
                this.grid.y.push([
                    0,
                    Math.round(i * this.blockSnapSize),
                    this.stageConfig.width,
                    Math.round(i * this.blockSnapSize)
                ]);
            }
        }
    },
    created() {
        window.addEventListener('resize', this.onWindowSizeChange);
    },
    watch: {
        rawZones() {
            this.zones = this.rawZones.filter(
                zone => !zone.site || _.isEqual(zone.site, this.typeSelected)
            );
        },
        eventNewest() {
            const listZoneWithCount = this.eventNewest.map(item => {
                const zone = _.find(this.zoneCamera, { cameraId: item.cameraId });
                return {
                    cameraId: item.cameraId,
                    count: item.count,
                    zoneId: zone ? zone.zoneId : null
                };
            });
            this.regions = [];
            for (const zone of this.zones) {
                if (!zone.regions) continue;
                zone.regions.forEach(region => {
                    let title = zone.name;
                    let background = 'green';
                    const zoneWithCount = _.find(listZoneWithCount, { zoneId: zone.id });
                    if (zoneWithCount) {
                        let maxBed = _.find(this.maxBeds, { cameraId: zoneWithCount.cameraId });
                        if (!maxBed) maxBed = 0;
                        title += ` (${zoneWithCount.count}/${maxBed.maxBed})`;
                        if (zoneWithCount.count !== 0 && zoneWithCount.count >= maxBed) {
                            background = 'red';
                        }
                    } else {
                        const camera = _.find(this.zoneCamera, { zoneId: zone.id });
                        if (camera) {
                            let maxBed = _.find(this.maxBeds, {
                                cameraId: camera.cameraId
                            });
                            if (!maxBed) maxBed = 0;
                            title += ` (0/${maxBed.maxBed})`;
                        }
                    }
                    this.regions.push({ points: region, title, id: zone.id, background });
                });
            }
            this.showAllZone();
        },
        zones() {
            this.regions = [];
            for (const zone of this.zones) {
                if (!zone.regions) continue;
                const zoneCam = _.find(this.zoneCamera, { zoneId: zone.id });
                let title = zone.name;
                if (zoneCam) {
                    let maxBed = _.find(this.maxBeds, { cameraId: zoneCam.cameraId });
                    if (!maxBed) maxBed = 0;
                    title += ` (0/${maxBed.maxBed})`;
                } else title += '\n(0/0)';
                zone.regions.forEach(region => {
                    this.regions.push({
                        points: region,
                        title,
                        id: zone.id,
                        background: 'green'
                    });
                });
            }
            this.stageConfig = {
                width: this.$refs.videoThumbnail.clientWidth,
                height: this.$refs.videoThumbnail.clientHeight
            };
            // Get image background dimensions
            const img = new Image();
            img.onload = () => {
                const { width, height } = img;
                this.backgroundImageDimensions = {
                    width,
                    height
                };
                this.scaleArea();
            };
            img.src = this.getBackgroundImageUrl();
        },
        message() {
            if (this.message.view === 'alert' && this.message.type === 'hospital-bed') {
                this.eventNewest = this.eventNewest.filter(
                    event => event.cameraId !== this.message.cameraId
                );
                this.eventNewest.push(this.message);
            }
        }
    },
    beforeDestroy() {
        if (this.filterNewestEventInterval) clearInterval(this.filterNewestEventInterval);
        if (this.fetchDataInterval) clearInterval(this.fetchDataInterval);
    },
    destroyed() {
        window.removeEventListener('resize', this.onWindowSizeChange);
    }
};
</script>
<style lang="scss">
.video-modal-border {
    border: 2px solid;
    border-color: silver;
}
.event-text-color {
    color: lime;
    background-color: rgba(0, 0, 0, 0.6);
}
.floorplan-select {
    background: url('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAA4AAAAMCAYAAABSgIzaAAAAM0lEQVQokWMYAYBRYcWN/7i8+SBCgxGXHBNIMw45nJpgGrEpwqsJWSOyYoKaRgRgYGAAAAPpBA7T8xX8AAAAAElFTkSuQmCC') !important;
    background-position: right 50% !important;
    background-repeat: no-repeat !important;
    max-width: max-content !important;
    padding-top: unset !important;
    padding-bottom: unset !important;
}
</style>
