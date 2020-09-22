<template>
    <div class="h-100 d-flex flex-column">
        <div class="px-3 pt-3">
            <b-row>
                <b-col cols="5" offset="1">
                    <b-form-group label="VMS:">
                        <b-form-select
                            v-model="form.vmsId"
                            :options="[
                                { id: null, name: $t('cam.chooseVms'), disabled: true },
                                ...vmsList
                            ]"
                            value-field="id"
                            text-field="name"
                            @change="vmsSelectChange"
                        >
                        </b-form-select>
                    </b-form-group>
                </b-col>
                <b-col cols="5">
                    <b-form-group :label="$t('user.group')">
                        <b-form-select
                            v-model="groupId"
                            :options="[{ id: null, name: $t('cam.all'), disabled: true }]"
                            value-field="id"
                            text-field="name"
                        >
                        </b-form-select>
                    </b-form-group>
                </b-col>
            </b-row>
        </div>

        <div class="flex-1 overflow-hidden">
            <div class="text-success px-3 py-2" v-if="vmsCameras.length">
                <i class="fa fa-check" aria-hidden="true"></i>
                {{ $t('cam.selectedCameraCount', { count: selectedVmsCameras.length }) }}
            </div>

            <div class="h-100 overflow-y-auto overflow-x-hidden px-3 pb-3">
                <b-row>
                    <b-col
                        cols="2"
                        v-for="vmsCamera in vmsCameras"
                        :key="vmsCamera.vmsCameraId"
                        class="mb-4"
                    >
                        <div
                            class="add-video_video-item cursor-pointer border rounded mb-2"
                            :class="{
                                'add-video_video-item_active border-success': isSelectedCamera(
                                    vmsCamera.vmsCameraId
                                )
                            }"
                            @click="toggleSelectCamera(vmsCamera)"
                        >
                            <div
                                class="case-video-thumbnail rounded ratio-16-9 text-center position-relative"
                                :style="{
                                    'background-image': `url(${vmsCamera.url})`
                                }"
                            >
                                <div
                                    class="obsolute-full d-flex justify-content-center align-items-center flex-column"
                                >
                                    <i
                                        class="fa fa-2x fa-eye-slash text-gray-300"
                                        aria-hidden="true"
                                        v-if="handleCameraError(vmsCamera)"
                                    ></i>
                                </div>
                            </div>
                            <i
                                v-if="isSelectedCamera(vmsCamera.vmsCameraId)"
                                class="fa fa-3x fa-check text-success add-video_video-item_active-icon"
                                aria-hidden="true"
                            ></i>
                        </div>
                        {{ vmsCamera.name }}
                    </b-col>
                </b-row>
            </div>

            <div
                class="h-100 d-flex justify-content-center align-items-center"
                v-if="!vmsCameras.length"
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
            :items="vmsCameras"
            :per="CONSTANTS.VIDEO_LIST_PER"
            @pageChanged="updatePagedItem"
            v-show="vmsCameras.length"
        ></r-pagination>
    </div>
</template>

<script>
import { mapActions, mapState } from 'vuex';
import CONSTANTS from '../constants';
import getVmsBaseUrl from '@/utils/getVmsBaseUrl';
import getVmsImageViewUrl from '@/utils/getVmsImageViewUrl';
import { setTimeout } from 'timers';

export default {
    name: 'import-camera-from-vms',
    components: {},
    mounted: function() {
        this.$nextTick(function() {
            this.getVmsList().then(() => {
                if (this.vmsList.length === 1) {
                    this.form.vmsId = this.vmsList[0].id;
                    this.vmsSelectChange();
                } else this.form.vmsId = null;
            });
        });
    },
    computed: {
        ...mapState({
            vmsCameras: state => state.vmsMonitor.items,
            vmsList: state => state.vms.items
        })
    },
    data() {
        return {
            CONSTANTS,

            selectedVms: null,
            selectedVmsCameras: [],

            form: {
                name: '',
                url: '',
                type: null,
                vmsId: null,
                vmsCameraId: null
            },
            groupId: null,
            isShowLoading: false,
            vmsCameraList: [],
            currentPage: 1,
            pagedItems: [],
            filteredItems: []
        };
    },
    methods: {
        ...mapActions({
            resetVmsMonitorData: 'vmsMonitor/resetData',
            resetvmsCameraData: 'vmsCamera/resetData',
            getVmsList: 'vms/getList',
            getVmsMonitorList: 'vmsMonitor/getList',
            getVmsCameraList: 'vmsMonitor/getList'
        }),
        getVmsBaseUrl,
        getVmsImageViewUrl,
        getAvailabledVideo(videoList) {
            return videoList.filter(video => video.status === CONSTANTS.VIDEO_STATUS.DONE);
        },
        vmsSelectChange() {
            this.form = {
                ...this.form,
                vmsCameraId: null
            };
            this.selectedVmsCameras = [];
            this.resetVmsMonitorData();
            this.selectedVms = this.vmsList.find(e => e.id === this.form.vmsId);

            // Fetch data
            this.getVmsCameraList({
                vmsBaseUrl: getVmsBaseUrl(this.selectedVms.ip, this.selectedVms.port),
                mode: 'special',
                user: this.selectedVms.username,
                pass: this.selectedVms.password
            });

            this.$emit('getVmsId', this.form.vmsId);
        },
        isSelectedCamera(vmsCameraId) {
            return this.selectedVmsCameras.find(cam => cam.vmsCameraId === vmsCameraId);
        },
        toggleSelectCamera: async function(vmsCamera) {
            if (this.isSelectedCamera(vmsCamera.vmsCameraId)) {
                const removedIndex = this.selectedVmsCameras.findIndex(
                    cam => cam.vmsCameraId === vmsCamera.vmsCameraId
                );
                this.selectedVmsCameras.splice(removedIndex, 1);
            } else {
                this.selectedVmsCameras.push(vmsCamera);
            }
            this.$emit('updateSelectedCameras', this.selectedVmsCameras);
        },
        updatePagedItem(pagedItems) {
            this.isShowLoading = true;
            setTimeout(() => {
                this.pagedItems = pagedItems;
                this.isShowLoading = false;
            }, 300);
        },
        handleCameraError(camera) {
            if (camera.status !== 'Connected') {
                return true;
            }
        }
    }
};
</script>

<style lang="scss" scoped>
</style>
