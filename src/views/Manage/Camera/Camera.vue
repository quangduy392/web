<template>
    <div class="animated fadeIn h-100">
        <!--  Sub header      -->
        <sub-header hideBreadcrumb>
            <!-- 4sub nav -->
            <template slot="sub-header-left">
                <b-navbar-nav class="d-flex flex-row">
                    <b-nav-item to="/management/manage/camera" class="text-nowrap"
                        >CAMERA</b-nav-item
                    >
                    <b-nav-item to="/management/manage/holiday" class="text-nowrap">{{
                        $t('holiday.pageTitle')
                    }}</b-nav-item>
                    <b-nav-item to="/management/manage/configuration" class="text-nowrap">{{
                        $t('configuration.pageTitle')
                    }}</b-nav-item>
                    <b-nav-item to="/management/manage/vms">VMS</b-nav-item>
                </b-navbar-nav>
            </template>
            <template slot="sub-header-middle"></template>
            <!--END 4sub nav -->
            <!-- Search bar -->
            <template slot="sub-header-right">
                <div class="d-flex justify-content-end align-items-center">
                    <div class="input-group border-bottom position-relative" style="width: 190px;">
                        <input
                            type="text"
                            class="form-control bg-transparent border-none text-white pr-4"
                            :placeholder="$t('common.search')"
                            aria-label="Search"
                            aria-describedby="button-addon2"
                            v-model="searchKeyword"
                            style="min-width: 190px;"
                        />
                        <i
                            class="fa fa-search position-absolute"
                            aria-hidden="true"
                            style="top: 50%;right: 4px;margin-top: -6px;"
                        ></i>
                    </div>
                    <div class="text-white mx-3 font-20">|</div>
                    <div class="d-flex align-items-center text-nowrap">
                        <b-button variant="outline-primary" class="mr-2" @click="openCreateModal">
                            <i class="fa fa-plus-circle mr-2"></i>
                            <span class="text-uppercase">{{ $t('cam.createCam') }}</span>
                        </b-button>
                        <b-button variant="outline-primary" @click="openImportModal">
                            <i class="fa fa-download mr-2"></i>
                            <span class="text-uppercase">{{ $t('cam.importCam') }}</span>
                        </b-button>
                    </div>
                </div>
            </template>
            <!-- END Search bar -->
        </sub-header>
        <!--  END Sub header      -->

        <!-- Page content -->
        <div class="page-content sub-header-page-content p-4">
            <b-table
                striped
                hover
                dark
                :items="displayedCameras"
                :current-page="currentPage"
                :per-page="CONSTANTS.CAMERA_ITEM_PER_PAGE"
                :fields="fields"
                show-empty
            >
                <template slot="index" slot-scope="data">
                    {{ (currentPage - 1) * CONSTANTS.CAMERA_ITEM_PER_PAGE + (data.index + 1) }}
                </template>
                <template slot="type" slot-scope="row">
                    <span>{{ typeName[row.value] }}</span>
                </template>
                <template slot="imageUrl" slot-scope="data">
                    <div
                        class="case-video-thumbnail ratio-16-9 text-center position-relative border border-gray-500 rounded"
                        :style="{ 'background-image': `url(${data.value})` }"
                    ></div>
                </template>
                <template slot="vmsId" slot-scope="row">
                    <span>{{ row.value ? vmsName[row.value] : '' }}</span>
                </template>
                <template slot="createdAt" slot-scope="data">
                    <span>{{ data.value | formatDateTime }}</span>
                </template>
                <template slot="actions" slot-scope="row">
                    <b-button
                        variant="success"
                        class="mr-1 min-width-none"
                        @click="openEditModal(row.item.id)"
                        v-b-tooltip.hover
                        :title="$t('common.edit')"
                    >
                        <i class="fa fa-pencil"></i>
                    </b-button>
                    <b-button
                        variant="danger"
                        @click="confirmDelete(row.item.id)"
                        v-b-tooltip.hover
                        class="min-width-none"
                        :title="$t('common.delete')"
                    >
                        <i class="fa fa-trash"></i>
                    </b-button>
                </template>
                <template slot="empty">
                    <div class="text-center">
                        <span>{{ $t('cam.empty') }}</span>
                    </div>
                </template>
            </b-table>
            <div v-if="countRow > CONSTANTS.CAMERA_ITEM_PER_PAGE" class="my-1">
                <b-pagination
                    v-model="currentPage"
                    :total-rows="countRow"
                    :per-page="CONSTANTS.CAMERA_ITEM_PER_PAGE"
                    :hide-goto-end-buttons="true"
                    :prev-text="$t('common.prevPage')"
                    :next-text="$t('common.nextPage')"
                    class="my-0"
                    align="center"
                ></b-pagination>
            </div>
        </div>
        <!-- END Page content -->

        <!-- Create/Edit Camera -->

        <b-modal
            ref="createOrUpdateCamModal"
            size="lg"
            ok-variant="primary"
            :ok-title="`${form.id ? $t('common.update') : $t('common.create')}`"
            :title="`${form.id ? $t('cam.updateCam') : $t('cam.createCam')}`"
            @ok="handleCreateVmsOk"
            no-close-on-esc
            no-close-on-backdrop
            :cancel-title="$t('common.cancel')"
        >
            <b-row>
                <b-col :cols="4" v-if="form.id">
                    <div
                        class="case-video-thumbnail ratio-16-9 text-center position-relative border border-gray-500 rounded"
                        :style="{ 'background-image': `url(${form.imageUrl})` }"
                    ></div>
                </b-col>
                <b-col :cols="form.id ? 8 : 12">
                    <b-form-group :label="$t('cam.name')">
                        <b-form-input
                            @click="autoType"
                            maxlength="255"
                            v-model="form.name"
                            v-validate="'required'"
                            :placeholder="$t('cam.name')"
                            name="name"
                            :data-vv-as="$t('cam.name')"
                        ></b-form-input>
                        <div v-show="errors.has('name')" class="validation-message text-danger">
                            {{ errors.first('name') }}
                        </div>
                    </b-form-group>

                    <b-form-group label="URL">
                        <b-form-input
                            @mouseleave="mouseOver"
                            @click="autoType"
                            v-on:keyup.enter="autoType"
                            maxlength="255"
                            v-model="form.url"
                            v-validate="'required'"
                            placeholder="URL"
                            name="url"
                            data-vv-as="URL"
                        ></b-form-input>
                        <!-- <div v-show="errors.has('url')" class="validation-message text-danger">
                            {{ errors.first('url') }}
                        </div> -->
                    </b-form-group>
                    <b-form-group :label="`Image URL ${$t('common.optional')}`">
                        <b-form-input
                            maxlength="255"
                            v-model="form.imageUrl"
                            placeholder="Image URL"
                        ></b-form-input>
                    </b-form-group>
                    <b-form-group :label="`Live URL ${$t('common.optional')}`">
                        <b-form-input
                            maxlength="255"
                            v-model="form.liveUrl"
                            placeholder="Live URL"
                        ></b-form-input>
                    </b-form-group>
                    <!--auto select type camera -->
                    <b-form-group v-if="checkType" :label="$t('cam.type')">
                        <b-form-input
                            @mouseover="mouseOver"
                            v-model="form.type"
                            maxlength="255"
                        ></b-form-input>
                    </b-form-group>
                    <b-form-group v-else :label="$t('cam.type')">
                        <b-form-select
                            v-model="form.type"
                            v-validate="'required'"
                            name="type"
                            :data-vv-as="$t('cam.type')"
                        >
                            <!-- <option
                                :value="this.form.type"
                                style="color: blue"
                            >{{ this.form.type.descEN }}</option>-->

                            <option
                                v-model="form.type"
                                v-for="camType in camTemp"
                                :value="camType.value"
                                >{{ camType.value }}</option
                            >
                        </b-form-select>
                        <!-- <div
                            v-show="errors.has('type')"
                            class="validation-message text-danger"
                        >{{ errors.first('type')  }}</div> -->
                    </b-form-group>

                    <!--END auto select type camera -->
                    <!-- <button class="btn btn-success" @click="autoType()">Show/Hide Type Of Camera</button> -->
                </b-col>
            </b-row>
            <transition name="slide">
                <div class="alert alert-danger" v-if="showhttps">{{ erroname }}</div>
            </transition>
        </b-modal>

        <!-- Import Camera from VMS -->
        <b-modal
            ref="importCamModal"
            size="xl"
            ok-variant="primary"
            :ok-title="$t('cam.save')"
            :title="$t('cam.importCam')"
            @ok="handleCreateVmsOk"
            no-close-on-esc
            no-close-on-backdrop
            :cancel-title="$t('common.cancel')"
            dialog-class="h-90"
            content-class="h-100"
            body-class="overflow-hidden p-0"
        >
            <ImportCamFormVms @updateSelectedCameras="updateSelectedCameras" @getVmsId="getVmsId" />
        </b-modal>

        <!-- Confirm Delete Camera -->
        <b-modal
            ref="deleteCamModal"
            :title="$t('common.confirmation')"
            no-close-on-esc
            no-close-on-backdrop
            :ok-title="$t('common.delete')"
            :cancel-title="$t('common.cancel')"
            ok-variant="danger"
            @ok="onDeleteCam"
            >{{ $t('cam.deleteConfirmMsg') }}</b-modal
        >
    </div>
</template>

<script>
import ManageSubNav from '../ManageSubNav';
import { mapActions, mapState } from 'vuex';
import CONSTANTS from '../../../constants';
import { i18n } from '../../../main';
import getVmsBaseUrl from '@/utils/getVmsBaseUrl';
import ImportCamFormVms from '@/components/ImportCamFormVms';
import changeAlias from '@/utils/changeAlias';
export default {
    components: { ImportCamFormVms, ManageSubNav },
    mounted: function() {
        this.$nextTick(function() {
            this.initData();
        });
    },
    data: function() {
        return {
            form: {
                name: '',
                url: '',
                type: '',
                vmsId: null,
                vmsCameraId: null
            },
            listCamImport: [],
            selectedVms: null,
            selectedVmsCamera: null,
            currentCamId: null,
            fields: [
                { tdClass: 'align-middle', key: 'index', label: '#' },
                {
                    tdClass: 'align-middle fixed-actions-col',
                    key: 'imageUrl',
                    label: this.$i18n.t('cam.image')
                },
                { tdClass: 'align-middle', key: 'name', label: this.$i18n.t('common.name') },
                { tdClass: 'align-middle', key: 'type', label: this.$i18n.t('cam.type') },
                { tdClass: 'align-middle', key: 'vmsId', label: 'VMS' },
                {
                    tdClass: 'align-middle',
                    key: 'createdAt',
                    label: this.$i18n.t('common.lastCreated')
                },
                {
                    thClass: 'fixed-actions-col',
                    tdClass: 'align-middle',
                    key: 'actions',
                    label: this.$i18n.t('common.actions')
                }
            ],
            CONSTANTS,
            currentPage: 1,
            searchKeyword: null,
            checkType: false,
            showhttps: false,
            erroname: ''
        };
    },
    computed: {
        ...mapState({
            listCameras: state => state.camera.items,
            camInfo: state => state.camera.item,
            camTemp: state => state.camera.camTemp,
            vmsCameras: state => state.vmsMonitor.items,
            vmsList: state => state.vms.items
        }),
        typeName() {
            const temp = {};
            this.camTemp.forEach(element => {
                temp[element.value] = element.descEN;
            });
            return temp;
        },
        vmsName() {
            const vmsName = {};
            this.vmsList.forEach(element => {
                vmsName[element.id] = element.name;
            });
            return vmsName;
        },
        countRow() {
            return this.displayedCameras.length;
        },
        locale() {
            return i18n.locale;
        },
        displayedCameras() {
            if (this.searchKeyword) {
                return this.listCameras.filter(camera => {
                    const keyword = changeAlias(this.searchKeyword.toLowerCase());
                    const cameraName = changeAlias(camera.name.toLowerCase());
                    return cameraName.indexOf(keyword) > -1;
                });
            }
            return this.listCameras;
        }
    },
    methods: {
        ...mapActions({
            getListVms: 'vms/getList',
            getCamTemp: 'camera/getCamTemp',
            getListCamera: 'camera/getList',
            getCameraInfo: 'camera/getCameraInfo',
            deleteCameraById: 'camera/delete',
            resetVmsMonitorData: 'vmsMonitor/resetData',
            getVmsCameraList: 'vmsMonitor/getList',
            updateOrCreate: 'camera/updateOrCreate',
            importCam: 'camera/importCam'
        }),
        getVmsBaseUrl,
        handleCreateVmsOk(modal) {
            modal.preventDefault();
            this.onSubmit();
        },
        openCreateModal() {
            this.resetForm();
            this.$refs.createOrUpdateCamModal.show();
        },
        openImportModal() {
            this.resetForm();
            this.$refs.importCamModal.show();
        },
        async openEditModal(camId) {
            this.resetForm();
            await this.getCameraInfo({ id: camId });
            this.form = { ...this.camInfo };
            this.$refs.createOrUpdateCamModal.show();
        },
        resetForm() {
            this.form = {};
            this.form.type = null;
            this.form.vmsId = null;
            this.form.vmsCameraId = null;
            this.resetVmsMonitorData();
        },
        confirmDelete(camId) {
            this.currentCamId = camId;
            this.$refs.deleteCamModal.show();
        },
        async onDeleteCam(modal) {
            modal.preventDefault();
            await this.deleteCameraById({ id: this.currentCamId });
            if (this.countRow / this.CONSTANTS.CAMERA_ITEM_PER_PAGE === this.currentPage - 1) {
                this.currentPage--;
            }
            this.getListCamera();
            this.$refs.deleteCamModal.hide();
            this.$toaster.success(this.$i18n.t('cam.deleteCamMess'));
        },
        onSubmit() {
            this.$validator.validateAll().then(result => {
                if (result) {
                    this.submitForm();
                }
            });
        },
        async submitForm() {
            if (this.form.id) {
                await this.updateOrCreate(this.form);
                this.$toaster.success(
                    `${this.$i18n.t('common.update')} ${this.$i18n.t('cam.camSuccess')}`
                );
            } else {
                if (this.form.vmsId) {
                    this.listCamImport.forEach(element => {
                        element.vmsId = this.form.vmsId;
                    });
                    if (this.listCamImport.length > 0) {
                        await this.importCam(this.listCamImport);
                        this.$toaster.success(
                            `${this.$i18n.t('cam.import')} ${this.$i18n.t('cam.camSuccess')}`
                        );
                        this.$refs.importCamModal.hide();
                    } else {
                        this.$toaster.error(`${this.$i18n.t('cam.importErrorMess')} `);
                    }
                } else {
                    delete this.form.vmsId;
                    delete this.form.vmsCameraId;
                    await this.updateOrCreate(this.form);
                    this.$toaster.success(
                        `${this.$i18n.t('common.create')} ${this.$i18n.t('cam.camSuccess')}`
                    );
                }
            }
            this.$refs.createOrUpdateCamModal.hide();
        },
        initData() {
            this.getListCamera();
            this.getListVms();
            this.getCamTemp();
            this.resetVmsMonitorData();
        },
        updateSelectedCameras(selectedCamera) {
            this.listCamImport = selectedCamera;
            this.listCamImport = this.listCamImport.map(item => {
                return {
                    vmsCameraId: item.vmsCameraId,
                    name: item.name,
                    status: item.status,
                    type: item.type,
                    liveUrl: item.liveurl,
                    url: item.url,
                    imageUrl: item.type === 'jpg' ? item.url : null
                };
            });
        },
        getVmsId(vmsId) {
            this.form.vmsId = vmsId;
        },
        autoType() {
            this.checkType = false;
            if (this.form.url === '') {
                this.erroname = 'URL is required!';
                this.showhttps = true;
                setTimeout(() => {
                    this.showhttps = false;
                }, 1500);
            } else {
                if (String(this.form.url).includes('https')) {
                    this.form.url = '';
                    this.erroname = 'HTTPS not yet supported. Only HTTP or RTSP !';
                    this.showhttps = true;
                    setTimeout(() => {
                        this.showhttps = false;
                    }, 1500);
                } else {
                    if (
                        String(this.form.url).includes('http') ||
                        String(this.form.url).includes('rtsp')
                    ) {
                        if (String(this.form.url).includes('mode=single')) {
                            this.form.type = 'jpg';
                            this.checkType = true;
                        } else if (String(this.form.url).includes('mode=jpeg')) {
                            this.form.type = 'mjpeg';
                            this.checkType = true;
                        } else if (String(this.form.url).includes('rtsp://')) {
                            this.form.type = 'rtsp';
                            this.checkType = true;
                        } else {
                            this.form.type = '';
                        }
                        return this.form.type;
                    } else {
                        this.form.url = '';
                        this.erroname = 'Only HTTP or RTSP !';
                        this.showhttps = true;
                        setTimeout(() => {
                            this.showhttps = false;
                        }, 1500);
                    }
                }
            }
        },
        mouseOver() {
            this.checkType = false;
            if (!String(this.form.url).includes('https')) {
                if (String(this.form.url).includes('mode=single')) {
                    this.form.type = 'jpg';
                    // this.checkType = true;
                } else if (String(this.form.url).includes('mode=jpeg')) {
                    this.form.type = 'mjpeg';
                    // this.checkType = true;
                } else if (String(this.form.url).includes('rtsp://')) {
                    this.form.type = 'rtsp';
                    // this.checkType = true;
                } else {
                    this.form.type = '';
                }
                return this.form.type;
            } else {
                this.form.url = '';
                this.erroname = 'HTTPS not yet supported. Only HTTP or RTSP !';
                this.showhttps = true;
                setTimeout(() => {
                    this.showhttps = false;
                }, 1500);
            }
        }
    }
};
</script>
<style lang="scss" scoped>
.fade-enter {
    opacity: 0;
}

.fade-enter-active {
    transition: opacity 0.5s;
}

.fade-leave {
    opacity: 1;
}

.fade-leave-active {
    transition: opacity 0.5s;
    opacity: 0;
}
.slide-enter {
    opacity: 0;
}

.slide-enter-active {
    transition: opacity 1s;
    animation: slide-in 1s ease-out forwards;
}

.slide-leave {
}

.slide-leave-active {
    opacity: 0;
    animation: slide-out 1s ease-out forwards;
}

/* kEY FRAME*/

@keyframes slide-in {
    from {
        transform: translateX(30px);
    }
    to {
        transform: translateX(0px);
    }
}
@keyframes slide-out {
    from {
        transform: translateX(0px);
    }
    to {
        transform: translateX(30px);
    }
}
</style>
